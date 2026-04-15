import { Injectable } from '@nestjs/common';

interface UssdSession {
  currentStep: string;
  data: Record<string, string>;
}

@Injectable()
export class SessionStoreService {
  private readonly sessions = new Map<string, UssdSession>();

  async get(sessionId: string): Promise<UssdSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async set(sessionId: string, session: UssdSession): Promise<void> {
    this.sessions.set(sessionId, session);
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}