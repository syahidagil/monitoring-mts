const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const users = await p.user.findMany({ where: { role: 'GURU' }, include: { guru: true } });
  console.log(JSON.stringify(users.map(u => ({ id: u.id, username: u.username, name: u.name, guruId: u.guru?.id })), null, 2));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
