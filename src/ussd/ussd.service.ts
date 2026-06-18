import { Injectable } from '@nestjs/common';
import { PaymentActionType, Role } from '@prisma/client';
import { ussdMenus } from '../config/ussd-menu.config';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStoreService } from './session-store.service';

@Injectable()
export class UssdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SessionStoreService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async processRequest(sessionId: string, phone: string, text: string): Promise<string> {
    if (!text || text.trim() === '') {
      const session = { currentStep: 'welcome', data: {} };
      await this.cache.set(sessionId, session);
      return `CON ${ussdMenus.welcome.text}`;
    }

    const parts = text.split('*');
    const latestInput = parts[parts.length - 1];

    const session = (await this.cache.get(sessionId)) ?? { currentStep: 'welcome', data: {} };
    const currentScreen = ussdMenus[session.currentStep];

    if (!currentScreen) {
      await this.cache.delete(sessionId);
      return 'END Session expired. Please dial again.';
    }

    // 1. Process standard steps
    if (currentScreen.type === 'input') {
      session.data[currentScreen.property!] = latestInput;
      session.currentStep = currentScreen.next!;

      if (currentScreen.next === 'mainMenu' && typeof session.data.fullName === 'string') {
        await this.saveCustomerProfile(phone, session.data);
      }
    }
    else if (currentScreen.type === 'choice') {
      const nextKey = currentScreen.options?.[parseInt(latestInput)];
      if (!nextKey) return `CON Invalid Choice.\n${currentScreen.text}`;
      session.currentStep = nextKey;
    }
    else if (currentScreen.type === 'dynamic-lookup') {
      const selectionIndex = parseInt(latestInput) - 1;
      const cachedOptions = session.data[`${session.currentStep}_options`] as string[] | undefined;
      
      if (!cachedOptions || !cachedOptions[selectionIndex]) {
        const structuralMenu = await this.buildLookupMenu(session);
        return `CON Invalid selection. Please try again.\n${structuralMenu}`;
      }
      
      session.data[currentScreen.property!] = cachedOptions[selectionIndex];
      session.currentStep = currentScreen.next!;
    }

    // 2. Fetch the target screen state
    const nextScreen = ussdMenus[session.currentStep];

    if (!nextScreen) {
      await this.cache.delete(sessionId);
      return 'END This option is not available right now. Please try again later.';
    }

    if (nextScreen.type === 'payment') {
      const paymentResult = await this.paymentsService.initiatePayment({
        phone,
        actionType: nextScreen.paymentAction as PaymentActionType,
        amount: nextScreen.amount,
        sessionId,
        metadata: session.data,
      });

      await this.cache.delete(sessionId);
      return `END ${paymentResult.message}`;
    }

    if (nextScreen.type === 'final') {
      await this.saveFinalPayload(session.currentStep, phone, session.data);
      await this.cache.delete(sessionId);
      return `END ${nextScreen.text}`;
    }

    // 3. Handle dynamic generation asynchronously if it hits a lookup step
    if (nextScreen.type === 'dynamic-lookup') {
      const dynamicText = await this.buildLookupMenu(session);
      await this.cache.set(sessionId, session);
      return `CON ${dynamicText}`;
    }

    await this.cache.set(sessionId, session);
    return `CON ${nextScreen.text}`;
  }

  // DB-backed dynamic search logic
  private async buildLookupMenu(session: any): Promise<string> {
    const currentStep = session.currentStep;
    
    const searchTarget = currentStep === 'workerSkillLookup' 
      ? session.data['typedSkill'] 
      : session.data['requestedSkill'];

    // Query database for skills that closely match user input
    const dbMatches = await this.prisma.skill.findMany({
      where: {
        name: {
          contains: searchTarget,
          mode: 'insensitive', // Catch variations like 'plumb', 'Plumber', 'PLUMBER'
        },
      },
      take: 5, // Limit menu size for clean USSD display constraint
    });

    // Map strings out of records
    let matches = dbMatches.map(s => s.name);

    // Fallback if the typed word does not match anything in the DB catalog
    if (matches.length === 0) {
      matches.push(searchTarget); 
    }

    // Temporarily save options to session cache so we can decode choice on next sequence tick
    session.data[`${currentStep}_options`] = matches;

    let responseMenu = currentStep === 'workerSkillLookup' 
      ? `Confirm your Skill Profile:\n` 
      : `Select matching category:\n`;

    matches.forEach((match, index) => {
      responseMenu += `${index + 1}. ${match}\n`;
    });

    return responseMenu;
  }

  private async saveCustomerProfile(
    phone: string,
    data: Record<string, string | string[]>,
  ) {
    const fullName = this.readString(data, 'fullName');
    const location = this.readString(data, 'location');

    await this.prisma.user.upsert({
      where: { phone },
      create: {
        phone,
        fullName,
        location,
        role: Role.CUSTOMER,
      },
      update: {
        fullName,
        location,
        role: Role.CUSTOMER,
      },
    });
  }

  private async saveFinalPayload(
    state: string,
    phone: string,
    data: Record<string, string | string[]>,
  ) {
    // --- 1. WORKER ONBOARDING SUCCESS ---
    if (state === 'workerSuccess') {
      // Upsert User with Name and Location collected during the worker track
      const user = await this.prisma.user.upsert({
        where: { phone },
        create: { 
          phone, 
          fullName: this.readString(data, 'fullName'),
          location: this.readString(data, 'location'),
          role: Role.WORKER 
        },
        update: { 
          fullName: this.readString(data, 'fullName'),
          location: this.readString(data, 'location'),
          role: Role.WORKER 
        },
      });
  
      // Upsert Worker profile details linked to the user account
      await this.prisma.worker.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          idNumber: this.readString(data, 'idNumber'),
          skill: this.readString(data, 'confirmedSkill'),
        },
        update: {
          idNumber: this.readString(data, 'idNumber'),
          skill: this.readString(data, 'confirmedSkill'),
        },
      });
    }
  
    // --- 2. JOB POSTING SUCCESS (REQUEST A FUNDI) ---
    // Job posting is completed after M-Pesa payment via PaymentsService.
    if (state === 'jobPosted') {
      return;
    }
  }

  private readString(data: Record<string, string | string[]>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  }
}