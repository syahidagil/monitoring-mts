const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const j = await p.jadwal.findMany({
    include: { tahunAjaran: true, mataPelajaran: true, kelas: true, guru: { include: { user: true } } },
    take: 10,
  });
  console.log(JSON.stringify(j.map(x => ({
    id: x.id, tahun: x.tahunAjaran.nama, semester: x.tahunAjaran.semester, aktif: x.tahunAjaran.status,
    mapel: x.mataPelajaran.namaMapel, kelas: x.kelas.nama, hari: x.hari,
    guru: x.guru.user.username,
  })), null, 2));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
