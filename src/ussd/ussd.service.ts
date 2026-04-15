import { Injectable } from '@nestjs/common';
import { ussdMenus, UssdStepType } from '../config/ussd-menu.config';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerMatchingService } from '../worker/services/worker.service';
import { SessionStoreService } from './session-store.service';

@Injectable()
export class UssdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workerService: WorkerMatchingService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  async process(sessionId: string, phone: string, text: string): Promise<string> {
    let session = await this.sessionStore.get(sessionId);

    if (!session) {
      session = { currentStep: 'welcome', data: {} };
    }

    if (!text || text.trim() === '') {
      const firstScreen = ussdMenus[session.currentStep];
      await this.sessionStore.set(sessionId, session);
      return this.formatResponse(firstScreen.type, firstScreen.text);
    }

    const parts = text.split('*');
    const latestInput = parts[parts.length - 1];
    const currentScreen = ussdMenus[session.currentStep];

    if (currentScreen.type === 'input') {
      session.data[currentScreen.property!] = latestInput;
      session.currentStep = currentScreen.next!;
    } else if (currentScreen.type === 'choice') {
      const selectedOption = Number.parseInt(latestInput, 10);
      const nextKey = currentScreen.options?.[selectedOption];

      if (!nextKey) {
        return this.formatResponse('choice', `Invalid choice.\n${currentScreen.text}`);
      }

      if (currentScreen.property && currentScreen.values?.[selectedOption]) {
        session.data[currentScreen.property] = currentScreen.values[selectedOption];
      }

      session.currentStep = nextKey;
    }

    const nextScreen = ussdMenus[session.currentStep];

    if (!nextScreen) {
      await this.sessionStore.delete(sessionId);
      return this.formatResponse('final', 'This option is not available right now. Please try again later.');
    }

    if (nextScreen.type === 'final') {
      await this.handleFinalState(session.currentStep, phone, session.data);
      await this.sessionStore.delete(sessionId);
      return this.formatResponse('final', nextScreen.text);
    }

    await this.sessionStore.set(sessionId, session);
    return this.formatResponse(nextScreen.type, nextScreen.text);
  }

  private formatResponse(type: UssdStepType, text: string): string {
    return `${type === 'final' ? 'END' : 'CON'} ${text}`;
  }

  private async handleFinalState(state: string, phone: string, data: Record<string, string>) {
    if (state === 'workerSuccess') {
      await this.workerService.createWorker(phone, data);
      return;
    }

    if (state === 'jobPosted') {
      const job = await this.prisma.job.create({
        data: {
          customer: {
            connectOrCreate: {
              where: { phone },
              create: { phone },
            },
          },
          skillNeeded: data.skillNeeded,
          location: data.jobLocation,
          description: data.description,
        },
      });

      await this.workerService.findAndNotifyWorkers(job.id);
    }
  }
}