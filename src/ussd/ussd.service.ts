import { Injectable } from '@nestjs/common';
import { ussdMenus } from '../config/ussd-menu.config';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerMatchingService } from '../worker/services/worker.service';

@Injectable()
export class UssdService {
  constructor(
    private prisma: PrismaService,
    private workerService: WorkerMatchingService,
    private cache: any // Assume a Redis/Cache implementation
  ) {}

  async process(sessionId: string, phone: string, text: string): Promise<string> {
    // 1. Session Init
    let session = await this.cache.get(sessionId) || { currentStep: 'welcome', data: {} };

    // Africa's Talking sends empty text on the first request in a session.
    // For that case, render the current menu directly.
    if (!text || text.trim() === '') {
      const firstScreen = ussdMenus[session.currentStep];
      await this.cache.set(sessionId, session);
      return firstScreen.type === 'final' ? `END ${firstScreen.text}` : `CON ${firstScreen.text}`;
    }

    const parts = text.split('*');
    const latestInput = parts[parts.length - 1];

    // 2. Handle Logic based on Screen Type
    const currentScreen = ussdMenus[session.currentStep];

    if (currentScreen.type === 'input') {
      session.data[currentScreen.property!] = latestInput;
      session.currentStep = currentScreen.next!;
    } 
    else if (currentScreen.type === 'choice') {
      const nextKey = currentScreen.options?.[parseInt(latestInput)];
      if (!nextKey) return `CON Invalid Choice.\n${currentScreen.text}`;
      session.currentStep = nextKey;
    }

    const nextScreen = ussdMenus[session.currentStep];

    // 3. Dynamic Persistence on Final States
    if (nextScreen.type === 'final') {
      await this.handleFinalState(session.currentStep, phone, session.data);
      await this.cache.delete(sessionId);
      return `END ${nextScreen.text}`;
    }

    await this.cache.set(sessionId, session);
    return `CON ${nextScreen.text}`;
  }

  private async handleFinalState(state: string, phone: string, data: any) {
    if (state === 'jobPosted') {
      const job = await this.prisma.job.create({
        data: {
          customer: { connectOrCreate: { where: { phone }, create: { phone } } },
          skillNeeded: data.skillNeeded,
          location: data.jobLocation,
          description: data.description,
        },
      });
      // Trigger matching engine
      await (this.workerService as any).findAndNotifyWorkers?.(job.id);
    }
  }
}