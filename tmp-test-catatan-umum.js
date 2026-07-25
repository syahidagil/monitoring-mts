const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const jadwalId = 1;
  const tanggal = new Date(new Date().toISOString().slice(0, 10)); // today, date-only

  // 1. Simulate saveAbsensiKelas() writing a note (create path)
  const note1 = 'Test catatan umum - siswa aktif semua';
  await p.absensiCatatanUmum.upsert({
    where: { jadwalId_tanggal: { jadwalId, tanggal } },
    update: { catatan: note1 },
    create: { jadwalId, tanggal, catatan: note1, guruId: (await p.guru.findFirst({ where: { user: { username: 'guru1' } } })).id },
  });
  console.log('Wrote note1, reading back via getCatatanUmum-equivalent...');

  // 2. Simulate getCatatanUmum() read
  let read1 = await p.absensiCatatanUmum.findUnique({ where: { jadwalId_tanggal: { jadwalId, tanggal } } });
  console.log('Read after create:', read1 && read1.catatan);
  console.assert(read1 && read1.catatan === note1, 'FAIL: note1 not persisted correctly');

  // 3. Simulate re-saving with a different note (update path via same upsert)
  const note2 = 'Test catatan umum - UPDATED - 2 siswa izin';
  await p.absensiCatatanUmum.upsert({
    where: { jadwalId_tanggal: { jadwalId, tanggal } },
    update: { catatan: note2 },
    create: { jadwalId, tanggal, catatan: note2, guruId: (await p.guru.findFirst({ where: { user: { username: 'guru1' } } })).id },
  });
  let read2 = await p.absensiCatatanUmum.findUnique({ where: { jadwalId_tanggal: { jadwalId, tanggal } } });
  console.log('Read after update:', read2 && read2.catatan);
  console.assert(read2 && read2.catatan === note2, 'FAIL: note2 update not persisted correctly');

  // 4. Simulate clearing (empty string -> deleteMany, per saveAbsensiKelas logic)
  await p.absensiCatatanUmum.deleteMany({ where: { jadwalId, tanggal } });
  let read3 = await p.absensiCatatanUmum.findUnique({ where: { jadwalId_tanggal: { jadwalId, tanggal } } });
  console.log('Read after delete (should be null):', read3);
  console.assert(read3 === null, 'FAIL: record was not deleted');

  console.log('ALL CHECKS PASSED');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
