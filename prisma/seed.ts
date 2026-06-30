import { PrismaClient, Role, Semester, JenisKelamin, StatusAbsensi, StatusHafalan, StatusTahsin, Predikat, Hari } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding...");

  // ── USERS ─────────────────────────────
  const hashPw = (pw: string) => bcrypt.hash(pw, 12);

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

  const guruUser = await prisma.user.upsert({
    where: { username: "guru1" },
    update: {},
    create: {
      username: "guru1",
      password: await hashPw("guru123"),
      role: Role.GURU,
      name: "Ahmad Fauzi, S.Pd",
      status: true,
    },
  });

  const ortuUser = await prisma.user.upsert({
    where: { username: "ortu1" },
    update: {},
    create: {
      username: "ortu1",
      password: await hashPw("ortu123"),
      role: Role.ORANGTUA,
      name: "Budi Santoso",
      status: true,
    },
  });

  // ── PROFIL GURU & ORTU ─────────────────
  await prisma.guru.upsert({
    where: { id: guruUser.id },
    update: {},
    create: {
      id: guruUser.id,
      mapel: "Matematika",
      nip: "198501012010011001",
      noHp: "081234567890",
    },
  });

  await prisma.orangTua.upsert({
    where: { id: ortuUser.id },
    update: {},
    create: {
      id: ortuUser.id,
      noHp: "082345678901",
      alamat: "Jl. Bintaro Indah No. 5",
    },
  });

  // ── MATA PELAJARAN ─────────────────────
await prisma.mataPelajaran.createMany({
  data: [
    { kodeMapel: "MTK",   namaMapel: "Matematika" },
    { kodeMapel: "BIN",   namaMapel: "Bhs. Indonesia" },
    { kodeMapel: "BING",  namaMapel: "Bhs. Inggris" },
    { kodeMapel: "IPA",   namaMapel: "IPA" },
    { kodeMapel: "IPS",   namaMapel: "IPS" },
    { kodeMapel: "PAI",   namaMapel: "Pend. Agama Islam" },
    { kodeMapel: "PKN",   namaMapel: "PKN" },
    { kodeMapel: "TAHF",  namaMapel: "Tahfidz" },
    { kodeMapel: "TAHS",  namaMapel: "Tahsin" },
  ],
  skipDuplicates: true,
});

// ── GURU MAPEL ─────────────────────────
await prisma.guruMapel.createMany({
  data: [
    { idGuru: guruUser.id, kodeMapel: "MTK" },
    { idGuru: guruUser.id, kodeMapel: "IPA" },
  ],
  skipDuplicates: true,
});

  // ── TAHUN AJARAN ───────────────────────
  const tahunAjaran = await prisma.tahunAjaran.upsert({
    where: { nama: "2024/2025" },
    update: {},
    create: {
      nama: "2024/2025",
      semester: Semester.GENAP,
      aktif: true,
    },
  });

  // ── KELAS ──────────────────────────────
const kelas7A = await prisma.kelas.upsert({
  where: { id: 1 },
  update: {},
  create: {
    nama: "7A",
    tingkat: 7,
    tahunAjaranId: tahunAjaran.id,
    waliKelasId: guruUser.id,
  },
});

  // ── SISWA ──────────────────────────────
const siswa = await prisma.siswa.upsert({
  where: { nis: "2024001" },
  update: {},
  create: {
    nis: "2024001",
    nama: "Muhammad Rizky Pratama",
    jenisKelamin: JenisKelamin.L,
    tanggalLahir: new Date("2011-03-15"),
    kelasId: kelas7A.id,
    orangTuaId: ortuUser.id,
    status: true,
  },
});
  // ── JADWAL ─────────────────────────────
const jadwal = await prisma.jadwal.upsert({
  where: { id: 1 },
  update: {},
  create: {
    kelasId: kelas7A.id,
    guruId: guruUser.id,
    mapel: "Matematika",
    hari: Hari.SENIN,
    jamMulai: "07:00",
    jamSelesai: "08:30",
  },
});

  // ── ABSENSI (3 hari terakhir) ──────────
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const tgl = new Date(today);
    tgl.setDate(today.getDate() - i);

    await prisma.absensi.upsert({
      where: {
        siswaId_jadwalId_tanggal: {
          siswaId: siswa.id,
          jadwalId: jadwal.id,
          tanggal: tgl,
        },
      },
      update: {},
      create: {
        siswaId: siswa.id,
        jadwalId: jadwal.id,
        guruId: guruUser.id,
        tanggal: tgl,
        status: i === 1 ? StatusAbsensi.SAKIT : StatusAbsensi.HADIR,
      },
    });
  }

  // ── NILAI ──────────────────────────────
  await prisma.nilai.createMany({
    data: [
      { siswaId: siswa.id, guruId: guruUser.id, mapel: "Matematika", jenis: "HARIAN", nilai: 85, semester: Semester.GENAP, tahunAjar: "2024/2025" },
      { siswaId: siswa.id, guruId: guruUser.id, mapel: "Matematika", jenis: "UTS",    nilai: 78, semester: Semester.GENAP, tahunAjar: "2024/2025" },
      { siswaId: siswa.id, guruId: guruUser.id, mapel: "Matematika", jenis: "TUGAS",  nilai: 90, semester: Semester.GENAP, tahunAjar: "2024/2025" },
    ],
    skipDuplicates: true,
  });

  // ── SIKAP ──────────────────────────────
  await prisma.sikap.createMany({
    data: [
      { siswaId: siswa.id, aspek: "Kedisiplinan",  predikat: Predikat.B,  semester: Semester.GENAP, tahunAjar: "2024/2025" },
      { siswaId: siswa.id, aspek: "Sopan Santun",  predikat: Predikat.SB, semester: Semester.GENAP, tahunAjar: "2024/2025" },
      { siswaId: siswa.id, aspek: "Kerja Sama",    predikat: Predikat.B,  semester: Semester.GENAP, tahunAjar: "2024/2025" },
    ],
    skipDuplicates: true,
  });

  // ── HAFALAN ────────────────────────────
  await prisma.hafalan.createMany({
    data: [
      { siswaId: siswa.id, surah: "Al-Fatihah", ayatMulai: 1, ayatSelesai: 7,  juz: 1, nilai: 95, status: StatusHafalan.LULUS },
      { siswaId: siswa.id, surah: "Al-Baqarah", ayatMulai: 1, ayatSelesai: 10, juz: 1, nilai: 80, status: StatusHafalan.PROSES },
    ],
    skipDuplicates: true,
  });

  // ── TAHSIN ─────────────────────────────
  await prisma.tahsin.createMany({
    data: [
      { siswaId: siswa.id, materi: "Makharijul Huruf", nilai: 88, status: StatusTahsin.LULUS },
      { siswaId: siswa.id, materi: "Hukum Nun Mati",   nilai: 75, status: StatusTahsin.PROSES },
    ],
    skipDuplicates: true,
  });

  // ── KONTEN PUBLIK LENGKAP ──────────────
await prisma.informasiSekolah.createMany({
  data: [
    // SEJARAH
    {
      kategori: "sejarah",
      judul: "Sejarah MTS Al-Amin Bintaro",
      isi: "MTS Al-Amin Bintaro didirikan pada tahun 1995 oleh Yayasan Al-Amin dengan visi membangun pendidikan Islam yang berkualitas di wilayah Bintaro dan sekitarnya. Selama lebih dari dua dekade, sekolah ini telah meluluskan ribuan alumni yang tersebar di seluruh penjuru tanah air dan berkontribusi nyata bagi masyarakat.",
      idUser: adminUser.id,
    },
    // VISI
    {
      kategori: "visi",
      judul: "Visi Sekolah",
      isi: "Terwujudnya peserta didik yang unggul dalam ilmu pengetahuan, Islami dalam akhlak, dan berwawasan global.",
      idUser: adminUser.id,
    },
    // MISI
    {
      kategori: "misi",
      judul: "Misi Sekolah",
      isi: "Menyelenggarakan pendidikan berkualitas berbasis teknologi dan nilai Islam|Mengembangkan potensi akademik dan non-akademik siswa secara optimal|Membangun karakter mulia melalui pembiasaan akhlak Islami|Menjalin kerjasama dengan lembaga pendidikan bertaraf nasional dan internasional",
      idUser: adminUser.id,
    },
    // TUJUAN
    {
      kategori: "tujuan",
      judul: "Tujuan Sekolah",
      isi: "Menghasilkan lulusan yang cerdas, berakhlak mulia, dan siap melanjutkan ke jenjang pendidikan lebih tinggi|Mewujudkan lingkungan belajar yang kondusif, Islami, dan inovatif|Meningkatkan prestasi akademik dan non-akademik di tingkat regional dan nasional",
      idUser: adminUser.id,
    },
    // FASILITAS
    {
      kategori: "fasilitas",
      judul: "Masjid Al-Amin",
      isi: "Masjid representatif berkapasitas 500 jamaah sebagai pusat kegiatan keagamaan sekolah",
      idUser: adminUser.id,
    },
    {
      kategori: "fasilitas",
      judul: "Laboratorium Komputer",
      isi: "40 unit komputer modern dengan koneksi internet berkecepatan tinggi",
      idUser: adminUser.id,
    },
    {
      kategori: "fasilitas",
      judul: "Perpustakaan Digital",
      isi: "Koleksi lebih dari 5.000 buku fisik dan akses ke ribuan e-book dan jurnal ilmiah",
      idUser: adminUser.id,
    },
    {
      kategori: "fasilitas",
      judul: "Lapangan Olahraga",
      isi: "Lapangan basket dan futsal standar dengan lampu penerangan untuk kegiatan sore hari",
      idUser: adminUser.id,
    },
    {
      kategori: "fasilitas",
      judul: "Laboratorium IPA",
      isi: "Peralatan laboratorium lengkap untuk praktikum fisika, kimia, dan biologi",
      idUser: adminUser.id,
    },
    {
      kategori: "fasilitas",
      judul: "Ruang Multimedia",
      isi: "Ruang belajar modern dengan proyektor, smart board, dan sistem audio berkualitas",
      idUser: adminUser.id,
    },
    // KURIKULUM
    {
      kategori: "kurikulum",
      judul: "Kurikulum Nasional",
      isi: "Menggunakan Kurikulum Merdeka sesuai regulasi Kemendikbud|Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris|Teknologi Informasi dan Komunikasi|Pendidikan Pancasila dan Kewarganegaraan|Seni Budaya dan Prakarya",
      idUser: adminUser.id,
    },
    {
      kategori: "kurikulum",
      judul: "Kurikulum Keislaman",
      isi: "Tahfidz Al-Quran (target minimal 3 juz selama 3 tahun)|Tahsin dan Tilawah Al-Quran|Fiqih, Akidah Akhlak, dan Sejarah Kebudayaan Islam|Bahasa Arab Komunikatif|Pembiasaan sholat dhuha dan dzuhur berjamaah",
      idUser: adminUser.id,
    },
    // PRESTASI
    {
      kategori: "prestasi",
      judul: "Juara 1 Olimpiade Matematika",
      isi: "Akademik|Tingkat Kota Tangerang Selatan|2024",
      idUser: adminUser.id,
    },
    {
      kategori: "prestasi",
      judul: "Juara 2 MTQ Tingkat Provinsi",
      isi: "Islami|Tingkat Provinsi Banten|2024",
      idUser: adminUser.id,
    },
    {
      kategori: "prestasi",
      judul: "Juara 1 Futsal Antar SMP/MTs",
      isi: "Non-Akademik|Tingkat Regional|2023",
      idUser: adminUser.id,
    },
    {
      kategori: "prestasi",
      judul: "Juara 3 Lomba Robotika Nasional",
      isi: "Akademik|Tingkat Nasional|2023",
      idUser: adminUser.id,
    },
    // BERITA
    {
      kategori: "berita",
      judul: "PSB 2025/2026 Resmi Dibuka",
      isi: "Penerimaan Siswa Baru tahun ajaran 2025/2026 resmi dibuka mulai 1 Februari 2025. Pendaftaran dapat dilakukan secara online melalui website resmi sekolah.",
      idUser: adminUser.id,
    },
    {
      kategori: "berita",
      judul: "Tim Futsal Raih Juara Regional",
      isi: "Tim futsal MTS Al-Amin Bintaro berhasil meraih juara pertama dalam kompetisi futsal antar SMP/MTs tingkat regional yang diselenggarakan di GOR Tangerang Selatan.",
      idUser: adminUser.id,
    },
    {
      kategori: "berita",
      judul: "Wisuda Tahfidz Angkatan ke-12",
      isi: "Sebanyak 48 siswa berhasil menyelesaikan program tahfidz Al-Quran minimal 3 juz dan diwisuda dalam acara yang meriah bersama orang tua dan keluarga.",
      idUser: adminUser.id,
    },
    {
      kategori: "berita",
      judul: "Kunjungan Dinas Pendidikan",
      isi: "Dinas Pendidikan Kota Tangerang Selatan melakukan kunjungan monitoring ke MTS Al-Amin Bintaro dalam rangka evaluasi implementasi Kurikulum Merdeka.",
      idUser: adminUser.id,
    },
    // EKSTRAKURIKULER
    {
      kategori: "ekstrakurikuler",
      judul: "Tahfidz Al-Quran",
      isi: "Senin & Rabu 14:00-16:00|Ustadz Ahmad Syafii|Membantu siswa menghafal Al-Quran dengan metode muroja'ah",
      idUser: adminUser.id,
    },
    {
      kategori: "ekstrakurikuler",
      judul: "Futsal",
      isi: "Selasa & Kamis 15:00-17:00|Coach Rendi|Melatih kemampuan bermain futsal dan kerjasama tim",
      idUser: adminUser.id,
    },
    {
      kategori: "ekstrakurikuler",
      judul: "Robotika",
      isi: "Sabtu 08:00-11:00|Bapak Irfan, S.T|Belajar merakit dan memprogram robot sederhana",
      idUser: adminUser.id,
    },
    {
      kategori: "ekstrakurikuler",
      judul: "Marawis",
      isi: "Senin & Jumat 14:00-16:00|Ustadz Ridwan|Seni musik Islami yang memadukan rebana dan vokal",
      idUser: adminUser.id,
    },
    {
      kategori: "ekstrakurikuler",
      judul: "Pramuka",
      isi: "Sabtu 13:00-16:00|Kak Dimas|Membentuk karakter mandiri, disiplin, dan cinta alam",
      idUser: adminUser.id,
    },
    {
      kategori: "ekstrakurikuler",
      judul: "Seni Lukis",
      isi: "Jumat 14:00-16:00|Ibu Siti Rahayu|Mengembangkan bakat seni rupa dan kreativitas siswa",
      idUser: adminUser.id,
    },
    // STATISTIK
    {
      kategori: "statistik",
      judul: "Data Statistik Sekolah",
      isi: "487|38|12|15",
      idUser: adminUser.id,
    },
  ],
  skipDuplicates: true,
});

  console.log("✅ Seeding selesai!");
  console.log("   Admin  : admin / admin123");
  console.log("   Guru   : guru1 / guru123");
  console.log("   Ortu   : ortu1 / ortu123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());