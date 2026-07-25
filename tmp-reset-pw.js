const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('guru123', 12);
  await p.user.update({ where: { username: 'guru1' }, data: { password: hash } });
  console.log('password reset for guru1');
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
