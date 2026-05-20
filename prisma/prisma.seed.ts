import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const defaultSkills = [
    'Plumber',
    'Mason (Fundi wa Mawe)',
    'Electrician',
    'Painter',
    'Carpenter',
    'Welder',
    'Tile Layer',
    'Foreman'
  ];

  console.log('🚀 Seeding skills into database...');
  
  for (const skill of defaultSkills) {
    await prisma.skill.upsert({
      where: { name: skill },
      update: {},
      create: { name: skill },
    });
  }
  
  console.log('✅ Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });