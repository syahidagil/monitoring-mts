const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const guru = await p.guru.findFirst({ where: { user: { username: 'guru1' } } });
  const kelas = await p.kelas.findFirst({ include: { siswa: true } });
  const mapel = await p.mataPelajaran.findFirst();
  const ta = await p.tahunAjaran.findFirst({ where: { aktif: true } });
  console.log('guru:', guru?.id, 'kelas:', kelas?.id, kelas?.nama, 'siswaCount:', kelas?.siswa?.length, 'mapel:', mapel?.id, mapel?.namaMapel, 'ta:', ta?.id, ta?.nama);

  const hariList = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
  const todayHari = hariList[new Date().getDay()];

  const jadwal = await p.jadwal.create({
    data: {
      hari: todayHari,
      jamMulai: "07:00",
      jamSelesai: "08:30",
      guruId: guru.id,
      kelasId: kelas.id,
      kodeMapel: mapel.kodeMapel,
      tahunAjaranId: ta.id,
    },
  });
  console.log('created jadwal id:', jadwal.id, 'hari:', jadwal.hari);
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
