const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const j = await p.jadwal.findMany({
    where: { guru: { user: { username: 'guru_ahmad' } } },
    include: { tahunAjaran: true, mataPelajaran: true, kelas: true },
  });
  console.log(JSON.stringify(j.map(x => ({
    id: x.id, tahun: x.tahunAjaran.nama, semester: x.tahunAjaran.semester,
    mapel: x.mataPelajaran.namaMapel, kelas: x.kelas.nama, hari: x.hari,
  })), null, 2));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
