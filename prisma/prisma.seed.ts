// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// This will now pass TypeScript validation smoothly:
await prisma.skill.upsert({
  where: { name: 'Plumber' },
  update: {},
  create: { name: 'Plumber' },
});