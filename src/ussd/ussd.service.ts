import { Injectable } from '@nestjs/common';
import { ussdMenus } from './ussd-menu.config.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UssdService {
  constructor(
    private prisma: PrismaService, 
    private cache: any // Replace with your Redis/Cache manager instance
  ) {}

  async processRequest(sessionId: string, phone: string, text: string): Promise<string> {
    const parts = text.split('*');
    const latestInput = parts[parts.length - 1];

    let session = await this.cache.get(sessionId) || { currentStep: 'welcome', data: {} };
    let currentScreen = ussdMenus[session.currentStep];

    // 1. Process standard steps
    if (currentScreen.type === 'input') {
      session.data[currentScreen.property!] = latestInput;
      session.currentStep = currentScreen.next!;
    } 
    else if (currentScreen.type === 'choice') {
      const nextKey = currentScreen.options?.[parseInt(latestInput)];
      if (!nextKey) return `CON Invalid Choice.\n${currentScreen.text}`;
      session.currentStep = nextKey;
    }
    else if (currentScreen.type === 'dynamic-lookup') {
      const selectionIndex = parseInt(latestInput) - 1;
      const cachedOptions = session.data[`${session.currentStep}_options`External];
      
      if (!cachedOptions || !cachedOptions[selectionIndex]) {
        const structuralMenu = await this.buildLookupMenu(session);
        return `CON Invalid selection. Please try again.\n${structuralMenu}`;
      }
      
      session.data[currentScreen.property!] = cachedOptions[selectionIndex];
      session.currentStep = currentScreen.next!;
    }

    // 2. Fetch the target screen state
    const nextScreen = ussdMenus[session.currentStep];

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

  private async saveFinalPayload(state: string, phone: string, data: any) {
    if (state === 'workerSuccess') {
      await this.prisma.worker.create({
        data: {
          user: { connectOrCreate: { where: { phone }, create: { phone } } },
          idNumber: data.idNumber,
          skill: data.confirmedSkill, 
        }
      });
    }
    if (state === 'jobPosted') {
      await this.prisma.job.create({
        data: {
          customer: { connectOrCreate: { where: { phone }, create: { phone } } },
          skillNeeded: data.matchedSkill, 
          location: data.jobLocation,
          description: `Requested via USSD DB lookup`,
        }
      });
    }
  }
}