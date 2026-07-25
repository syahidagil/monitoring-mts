const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  console.log('jadwal count:', await p.jadwal.count());
  console.log('tahunAjaran count:', await p.tahunAjaran.count());
  console.log('guru count:', await p.guru.count());
  console.log('kelas count:', await p.kelas.count());
  console.log('mataPelajaran count:', await p.mataPelajaran.count());
  const tas = await p.tahunAjaran.findMany();
  console.log(JSON.stringify(tas, null, 2));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
