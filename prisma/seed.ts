import {
  PrismaClient, Role, Semester, JenisKelamin,
  StatusAbsensi, StatusHafalan, StatusTahsin,
  Predikat, Hari, KategoriInfo
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seeding...");
  const hashPw = (pw: string) => bcrypt.hash(pw, 12);

  // ── ADMIN ──────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hashPw("admin123"),
      role: Role.ADMIN,
      name: "Administrator",
      status: true,
    },
  });

  // ── TAHUN AJARAN ───────────────────────────────────────────
  const tahunAjaranData = [
    { nama: "2021/2022", semester: Semester.GENAP,  aktif: false },
    { nama: "2022/2023", semester: Semester.GENAP,  aktif: false },
    { nama: "2023/2024", semester: Semester.GENAP,  aktif: false },
    { nama: "2024/2025", semester: Semester.GENAP,  aktif: false },
    { nama: "2025/2026", semester: Semester.GANJIL, aktif: true  },
  ];

  const tahunAjaranList = [];
  for (const ta of tahunAjaranData) {
    const result = await prisma.tahunAjaran.upsert({
      where: { nama: ta.nama },
      update: { aktif: ta.aktif },
      create: ta,
    });
    tahunAjaranList.push(result);
  }
  const tahunAktif = tahunAjaranList.find((t) => t.aktif)!;
  console.log("Tahun ajaran selesai");

  // ── MATA PELAJARAN ─────────────────────────────────────────
  const mapelData = [
    { kodeMapel: "MTK",  namaMapel: "Matematika" },
    { kodeMapel: "IPA",  namaMapel: "Ilmu Pengetahuan Alam" },
    { kodeMapel: "BIN",  namaMapel: "Bahasa Indonesia" },
    { kodeMapel: "BAR",  namaMapel: "Bahasa Arab" },
    { kodeMapel: "FIQ",  namaMapel: "Fiqih" },
  ];

  for (const mp of mapelData) {
    await prisma.mataPelajaran.upsert({
      where: { kodeMapel: mp.kodeMapel },
      update: {},
      create: mp,
    });
  }
  console.log("Mata pelajaran selesai");

  // ── GURU (User + profil Guru) ──────────────────────────────
  const guruData = [
    {
      username: "guru_ahmad",
      password: "guru123",
      name: "Ahmad Fauzi, S.Pd",
      nip: "198501012010011001",
      mapel: "Matematika",
      noHp: "081234567890",
      alamat: "Jl. Mawar No. 1, Bintaro",
      pendidikan: "S1 Matematika UNPAD",
    },
    {
      username: "guru_siti",
      password: "guru123",
      name: "Siti Rahayu, S.Pd",
      nip: "198701052012012002",
      mapel: "Bahasa Indonesia",
      noHp: "082345678901",
      alamat: "Jl. Melati No. 5, Bintaro",
      pendidikan: "S1 Bahasa Indonesia UNJ",
    },
    {
      username: "guru_ridwan",
      password: "guru123",
      name: "Ridwan Kamil, S.Ag",
      nip: "199001102015011003",
      mapel: "Fiqih",
      noHp: "083456789012",
      alamat: "Jl. Kenanga No. 8, Bintaro",
      pendidikan: "S1 Pendidikan Agama Islam UIN",
    },
  ];

  const guruUsers = [];
  for (const g of guruData) {
    const user = await prisma.user.upsert({
      where: { username: g.username },
      update: {},
      create: {
        username: g.username,
        password: await hashPw(g.password),
        role: Role.GURU,
        name: g.name,
        status: true,
      },
    });

    await prisma.guru.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        nip: g.nip,
        mapel: g.mapel,
        noHp: g.noHp,
        alamat: g.alamat,
        pendidikan: g.pendidikan,
      },
    });

    await prisma.guruMapel.upsert({
      where: { idGuru_kodeMapel: { idGuru: user.id, kodeMapel: mapelData.find(m => m.namaMapel === g.mapel)?.kodeMapel ?? "MTK" } },
      update: {},
      create: {
        idGuru: user.id,
        kodeMapel: mapelData.find(m => m.namaMapel === g.mapel)?.kodeMapel ?? "MTK",
      },
    });

    guruUsers.push({ user, profil: g });
  }
  console.log("Guru selesai");

  // ── KELAS ──────────────────────────────────────────────────
  const kelasData = [
    { nama: "7A", tingkat: 7, waliKelasIdx: 0 },
    { nama: "7B", tingkat: 7, waliKelasIdx: 1 },
    { nama: "8A", tingkat: 8, waliKelasIdx: 2 },
    { nama: "8B", tingkat: 8, waliKelasIdx: 0 },
    { nama: "9A", tingkat: 9, waliKelasIdx: 1 },
  ];

  const kelasList = [];
  for (const k of kelasData) {
    const existing = await prisma.kelas.findFirst({
      where: { nama: k.nama, tahunAjaranId: tahunAktif.id },
    });

    if (existing) {
      kelasList.push(existing);
    } else {
      const kelas = await prisma.kelas.create({
        data: {
          nama: k.nama,
          tingkat: k.tingkat,
          tahunAjaranId: tahunAktif.id,
          waliKelasId: guruUsers[k.waliKelasIdx].user.id,
        },
      });
      kelasList.push(kelas);
    }
  }
  console.log("Kelas selesai");

  // ── ORANG TUA (User + profil OrangTua) ────────────────────
  const ortuData = [
    {
      username: "ortu_budi",
      password: "ortu123",
      name: "Budi Santoso",
      noHp: "082345678901",
      alamat: "Jl. Bintaro Indah No. 5",
      pekerjaan: "Wiraswasta",
    },
    {
      username: "ortu_dewi",
      password: "ortu123",
      name: "Dewi Lestari",
      noHp: "083456789012",
      alamat: "Jl. Griya Bintaro No. 12",
      pekerjaan: "Ibu Rumah Tangga",
    },
    {
      username: "ortu_hendra",
      password: "ortu123",
      name: "Hendra Wijaya",
      noHp: "084567890123",
      alamat: "Jl. Bintaro Sektor 5 No. 20",
      pekerjaan: "PNS",
    },
  ];

  const ortuUsers = [];
  for (const o of ortuData) {
    const user = await prisma.user.upsert({
      where: { username: o.username },
      update: {},
      create: {
        username: o.username,
        password: await hashPw(o.password),
        role: Role.ORANGTUA,
        name: o.name,
        status: true,
      },
    });

    await prisma.orangTua.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        noHp: o.noHp,
        alamat: o.alamat,
        pekerjaan: o.pekerjaan,
      },
    });

    ortuUsers.push(user);
  }
  console.log("Orang tua selesai");

  // ── SISWA ──────────────────────────────────────────────────
  const siswaData = [
    {
      nis: "2025001",
      nama: "Muhammad Rizky Pratama",
      jenisKelamin: JenisKelamin.L,
      tanggalLahir: new Date("2012-03-15"),
      tempatLahir: "Jakarta",
      alamat: "Jl. Bintaro Indah No. 5",
      namaAyah: "Budi Santoso",
      namaIbu: "Sari Dewi",
      statusTahfidz: true,
      kelasIdx: 0,
      ortuIdx: 0,
    },
    {
      nis: "2025002",
      nama: "Fatimah Az-Zahra",
      jenisKelamin: JenisKelamin.P,
      tanggalLahir: new Date("2012-07-22"),
      tempatLahir: "Tangerang",
      alamat: "Jl. Griya Bintaro No. 12",
      namaAyah: "Hendra Wijaya",
      namaIbu: "Dewi Lestari",
      statusTahfidz: true,
      kelasIdx: 1,
      ortuIdx: 1,
    },
    {
      nis: "2025003",
      nama: "Ahmad Zaki Mubarak",
      jenisKelamin: JenisKelamin.L,
      tanggalLahir: new Date("2011-11-08"),
      tempatLahir: "Bogor",
      alamat: "Jl. Bintaro Sektor 5 No. 20",
      namaAyah: "Hendra Wijaya",
      namaIbu: "Sri Mulyani",
      statusTahfidz: false,
      kelasIdx: 2,
      ortuIdx: 2,
    },
    {
      nis: "2025004",
      nama: "Siti Nur Aisyah",
      jenisKelamin: JenisKelamin.P,
      tanggalLahir: new Date("2012-01-30"),
      tempatLahir: "Depok",
      alamat: "Jl. Bintaro Indah No. 7",
      namaAyah: "Budi Santoso",
      namaIbu: "Rina Wati",
      statusTahfidz: true,
      kelasIdx: 3,
      ortuIdx: 0,
    },
    {
      nis: "2025005",
      nama: "Yusuf Al-Hakim",
      jenisKelamin: JenisKelamin.L,
      tanggalLahir: new Date("2011-05-17"),
      tempatLahir: "Bekasi",
      alamat: "Jl. Mawar Raya No. 3",
      namaAyah: "Hendra Wijaya",
      namaIbu: "Dewi Lestari",
      statusTahfidz: false,
      kelasIdx: 4,
      ortuIdx: 2,
    },
  ];

  const siswaList = [];
  for (const s of siswaData) {
    const siswa = await prisma.siswa.upsert({
      where: { nis: s.nis },
      update: {},
      create: {
        nis: s.nis,
        nama: s.nama,
        jenisKelamin: s.jenisKelamin,
        tanggalLahir: s.tanggalLahir,
        tempatLahir: s.tempatLahir,
        alamat: s.alamat,
        namaAyah: s.namaAyah,
        namaIbu: s.namaIbu,
        statusTahfidz: s.statusTahfidz,
        kelasId: kelasList[s.kelasIdx].id,
        orangTuaId: ortuUsers[s.ortuIdx].id,
        status: true,
      },
    });
    siswaList.push(siswa);
  }
  console.log("Siswa selesai");

  // ── JADWAL ─────────────────────────────────────────────────
  const jadwalList = [];
  const jadwalData = [
    { kelasIdx: 0, guruIdx: 0, mapel: "Matematika", hari: Hari.SENIN,   jamMulai: "07:00", jamSelesai: "08:30" },
    { kelasIdx: 0, guruIdx: 1, mapel: "Bahasa Indonesia", hari: Hari.SELASA, jamMulai: "07:00", jamSelesai: "08:30" },
    { kelasIdx: 2, guruIdx: 2, mapel: "Fiqih", hari: Hari.RABU,    jamMulai: "09:00", jamSelesai: "10:30" },
  ];

  for (const j of jadwalData) {
    const existing = await prisma.jadwal.findFirst({
      where: {
        kelasId: kelasList[j.kelasIdx].id,
        guruId: guruUsers[j.guruIdx].user.id,
        hari: j.hari,
      },
    });
    if (!existing) {
      const jadwal = await prisma.jadwal.create({
        data: {
          kelasId: kelasList[j.kelasIdx].id,
          guruId: guruUsers[j.guruIdx].user.id,
          mapel: j.mapel,
          hari: j.hari,
          jamMulai: j.jamMulai,
          jamSelesai: j.jamSelesai,
        },
      });
      jadwalList.push(jadwal);
    }
  }
  console.log("Jadwal selesai");

  // ── ABSENSI (sample) ───────────────────────────────────────
  if (jadwalList.length > 0) {
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const tgl = new Date(today);
      tgl.setDate(today.getDate() - i);
      await prisma.absensi.upsert({
        where: {
          siswaId_jadwalId_tanggal: {
            siswaId: siswaList[0].id,
            jadwalId: jadwalList[0].id,
            tanggal: tgl,
          },
        },
        update: {},
        create: {
          siswaId: siswaList[0].id,
          jadwalId: jadwalList[0].id,
          guruId: guruUsers[0].user.id,
          tanggal: tgl,
          status: i === 1 ? StatusAbsensi.SAKIT : StatusAbsensi.HADIR,
        },
      });
    }
  }
  console.log("Absensi selesai");

  // ── NILAI (sample) ─────────────────────────────────────────
  await prisma.nilai.createMany({
    data: [
      { siswaId: siswaList[0].id, guruId: guruUsers[0].user.id, mapel: "Matematika", jenis: "HARIAN", nilai: 85, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[0].id, guruId: guruUsers[0].user.id, mapel: "Matematika", jenis: "UTS",    nilai: 78, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[1].id, guruId: guruUsers[1].user.id, mapel: "Bahasa Indonesia", jenis: "HARIAN", nilai: 90, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[2].id, guruId: guruUsers[2].user.id, mapel: "Fiqih", jenis: "UAS", nilai: 88, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
    ],
    skipDuplicates: true,
  });
  console.log("Nilai selesai");

  // ── SIKAP (sample) ─────────────────────────────────────────
  await prisma.sikap.createMany({
    data: [
      { siswaId: siswaList[0].id, aspek: "Kedisiplinan",  predikat: Predikat.B,  semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[0].id, aspek: "Sopan Santun",  predikat: Predikat.SB, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[1].id, aspek: "Kedisiplinan",  predikat: Predikat.SB, semester: Semester.GANJIL, tahunAjar: "2025/2026" },
      { siswaId: siswaList[2].id, aspek: "Kerja Sama",    predikat: Predikat.B,  semester: Semester.GANJIL, tahunAjar: "2025/2026" },
    ],
    skipDuplicates: true,
  });
  console.log("Sikap selesai");

  // ── HAFALAN (sample) ───────────────────────────────────────
  await prisma.hafalan.createMany({
    data: [
      { siswaId: siswaList[0].id, surah: "Al-Fatihah", ayatMulai: 1, ayatSelesai: 7,  juz: 1, nilai: 95, status: StatusHafalan.LULUS },
      { siswaId: siswaList[0].id, surah: "Al-Baqarah", ayatMulai: 1, ayatSelesai: 10, juz: 1, nilai: 80, status: StatusHafalan.PROSES },
      { siswaId: siswaList[1].id, surah: "Al-Fatihah", ayatMulai: 1, ayatSelesai: 7,  juz: 1, nilai: 98, status: StatusHafalan.LULUS },
      { siswaId: siswaList[2].id, surah: "Al-Ikhlas",  ayatMulai: 1, ayatSelesai: 4,  juz: 30, nilai: 92, status: StatusHafalan.LULUS },
    ],
    skipDuplicates: true,
  });
  console.log("Hafalan selesai");

  // ── TAHSIN (sample) ────────────────────────────────────────
  await prisma.tahsin.createMany({
    data: [
      { siswaId: siswaList[0].id, materi: "Makharijul Huruf", nilai: 88, status: StatusTahsin.LULUS },
      { siswaId: siswaList[0].id, materi: "Hukum Nun Mati",   nilai: 75, status: StatusTahsin.PROSES },
      { siswaId: siswaList[1].id, materi: "Makharijul Huruf", nilai: 95, status: StatusTahsin.LULUS },
      { siswaId: siswaList[2].id, materi: "Mad dan Qashr",    nilai: 82, status: StatusTahsin.LULUS },
    ],
    skipDuplicates: true,
  });
  console.log("Tahsin selesai");

  // ── KONTEN PUBLIK ──────────────────────────────────────────
  const kontenPublik = [
    { kategori: "sejarah" as KategoriInfo, judul: "Sejarah MTS Al-Amin Bintaro", isi: "MTS Al-Amin Bintaro didirikan pada tahun 1995 oleh Yayasan Al-Amin dengan visi membangun pendidikan Islam yang berkualitas di wilayah Bintaro dan sekitarnya." },
    { kategori: "visi" as KategoriInfo, judul: "Visi Sekolah", isi: "Terwujudnya peserta didik yang unggul dalam ilmu pengetahuan, Islami dalam akhlak, dan berwawasan global." },
    { kategori: "misi" as KategoriInfo, judul: "Misi Sekolah", isi: "Menyelenggarakan pendidikan berkualitas berbasis teknologi dan nilai Islam|Mengembangkan potensi akademik dan non-akademik siswa secara optimal|Membangun karakter mulia melalui pembiasaan akhlak Islami|Menjalin kerjasama dengan lembaga pendidikan bertaraf nasional dan internasional" },
    { kategori: "tujuan" as KategoriInfo, judul: "Tujuan Sekolah", isi: "Menghasilkan lulusan yang cerdas, berakhlak mulia|Mewujudkan lingkungan belajar yang kondusif dan Islami|Meningkatkan prestasi akademik dan non-akademik" },
    { kategori: "berita" as KategoriInfo, judul: "PSB 2025/2026 Resmi Dibuka", isi: "Penerimaan Siswa Baru tahun ajaran 2025/2026 resmi dibuka mulai 1 Februari 2025." },
    { kategori: "berita" as KategoriInfo, judul: "Tim Futsal Raih Juara Regional", isi: "Tim futsal MTS Al-Amin Bintaro berhasil meraih juara pertama dalam kompetisi futsal antar SMP/MTs tingkat regional." },
    { kategori: "prestasi" as KategoriInfo, judul: "Juara 1 Olimpiade Matematika", isi: "Akademik|Tingkat Kota Tangerang Selatan|2025" },
    { kategori: "prestasi" as KategoriInfo, judul: "Juara 2 MTQ Tingkat Provinsi", isi: "Islami|Tingkat Provinsi Banten|2025" },
    { kategori: "fasilitas" as KategoriInfo, judul: "Masjid Al-Amin", isi: "Masjid representatif berkapasitas 500 jamaah sebagai pusat kegiatan keagamaan sekolah" },
    { kategori: "fasilitas" as KategoriInfo, judul: "Laboratorium Komputer", isi: "40 unit komputer modern dengan koneksi internet berkecepatan tinggi" },
    { kategori: "kurikulum" as KategoriInfo, judul: "Kurikulum Nasional", isi: "Matematika|IPA|Bahasa Indonesia|Bahasa Inggris|IPS|PKN|Seni Budaya" },
    { kategori: "kurikulum" as KategoriInfo, judul: "Kurikulum Keislaman", isi: "Tahfidz Al-Quran|Tahsin dan Tilawah|Fiqih|Akidah Akhlak|Bahasa Arab" },
    { kategori: "ekstrakurikuler" as KategoriInfo, judul: "Tahfidz Al-Quran", isi: "Senin & Rabu 14:00-16:00|Ustadz Ahmad Syafii|Membantu siswa menghafal Al-Quran" },
    { kategori: "ekstrakurikuler" as KategoriInfo, judul: "Futsal", isi: "Selasa & Kamis 15:00-17:00|Coach Rendi|Melatih kemampuan bermain futsal" },
    { kategori: "statistik" as KategoriInfo, judul: "Statistik Sekolah", isi: "487|38|124|15" },
  ];

  for (const konten of kontenPublik) {
    await prisma.informasiSekolah.upsert({
      where: { idInfo: (await prisma.informasiSekolah.findFirst({ where: { kategori: konten.kategori, judul: konten.judul } }))?.idInfo ?? 0 },
      update: { isi: konten.isi },
      create: { ...konten, idUser: adminUser.id },
    });
  }
  console.log("Konten publik selesai");

  console.log("Seeding selesai!");
  console.log("Akun tersedia:");
  console.log("  Admin     : admin / admin123");
  console.log("  Guru 1    : guru_ahmad / guru123");
  console.log("  Guru 2    : guru_siti / guru123");
  console.log("  Guru 3    : guru_ridwan / guru123");
  console.log("  Ortu 1    : ortu_budi / ortu123");
  console.log("  Ortu 2    : ortu_dewi / ortu123");
  console.log("  Ortu 3    : ortu_hendra / ortu123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());