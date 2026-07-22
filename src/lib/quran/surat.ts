// Data referensi 114 surat Al-Qur'an (nama, jumlah ayat, juz, tempat turun).
// Jumlah ayat memakai hitungan Kufah / riwayat Hafs dari Imam 'Ashim,
// sesuai mushaf standar Kementerian Agama RI (total 6.236 ayat).
// TIDAK memuat teks Al-Qur'an, hanya metadata untuk keperluan monitoring tahfidz & tahsin.

export type TempatTurun = "Makkiyah" | "Madaniyah";

export interface Surat {
  nomor: number;        // 1-114
  nama: string;         // nama Arab
  namaLatin: string;    // transliterasi
  arti: string;         // arti dalam bahasa Indonesia
  jumlahAyat: number;
  tempatTurun: TempatTurun;
  juzMulai: number;     // juz tempat surat ini dimulai
}

export const DAFTAR_SURAT: readonly Surat[] = [
  { nomor: 1, nama: "الفاتحة", namaLatin: "Al-Fatihah", arti: "Pembukaan", jumlahAyat: 7, tempatTurun: "Makkiyah", juzMulai: 1 },
  { nomor: 2, nama: "البقرة", namaLatin: "Al-Baqarah", arti: "Sapi Betina", jumlahAyat: 286, tempatTurun: "Madaniyah", juzMulai: 1 },
  { nomor: 3, nama: "آل عمران", namaLatin: "Ali 'Imran", arti: "Keluarga Imran", jumlahAyat: 200, tempatTurun: "Madaniyah", juzMulai: 3 },
  { nomor: 4, nama: "النساء", namaLatin: "An-Nisa'", arti: "Wanita", jumlahAyat: 176, tempatTurun: "Madaniyah", juzMulai: 4 },
  { nomor: 5, nama: "المائدة", namaLatin: "Al-Ma'idah", arti: "Hidangan", jumlahAyat: 120, tempatTurun: "Madaniyah", juzMulai: 6 },
  { nomor: 6, nama: "الأنعام", namaLatin: "Al-An'am", arti: "Binatang Ternak", jumlahAyat: 165, tempatTurun: "Makkiyah", juzMulai: 7 },
  { nomor: 7, nama: "الأعراف", namaLatin: "Al-A'raf", arti: "Tempat Tertinggi", jumlahAyat: 206, tempatTurun: "Makkiyah", juzMulai: 8 },
  { nomor: 8, nama: "الأنفال", namaLatin: "Al-Anfal", arti: "Harta Rampasan Perang", jumlahAyat: 75, tempatTurun: "Madaniyah", juzMulai: 9 },
  { nomor: 9, nama: "التوبة", namaLatin: "At-Taubah", arti: "Pengampunan", jumlahAyat: 129, tempatTurun: "Madaniyah", juzMulai: 10 },
  { nomor: 10, nama: "يونس", namaLatin: "Yunus", arti: "Nabi Yunus", jumlahAyat: 109, tempatTurun: "Makkiyah", juzMulai: 11 },
  { nomor: 11, nama: "هود", namaLatin: "Hud", arti: "Nabi Hud", jumlahAyat: 123, tempatTurun: "Makkiyah", juzMulai: 11 },
  { nomor: 12, nama: "يوسف", namaLatin: "Yusuf", arti: "Nabi Yusuf", jumlahAyat: 111, tempatTurun: "Makkiyah", juzMulai: 12 },
  { nomor: 13, nama: "الرعد", namaLatin: "Ar-Ra'd", arti: "Guruh", jumlahAyat: 43, tempatTurun: "Madaniyah", juzMulai: 13 },
  { nomor: 14, nama: "إبراهيم", namaLatin: "Ibrahim", arti: "Nabi Ibrahim", jumlahAyat: 52, tempatTurun: "Makkiyah", juzMulai: 13 },
  { nomor: 15, nama: "الحجر", namaLatin: "Al-Hijr", arti: "Gunung Al-Hijr", jumlahAyat: 99, tempatTurun: "Makkiyah", juzMulai: 14 },
  { nomor: 16, nama: "النحل", namaLatin: "An-Nahl", arti: "Lebah", jumlahAyat: 128, tempatTurun: "Makkiyah", juzMulai: 14 },
  { nomor: 17, nama: "الإسراء", namaLatin: "Al-Isra'", arti: "Memperjalankan di Malam Hari", jumlahAyat: 111, tempatTurun: "Makkiyah", juzMulai: 15 },
  { nomor: 18, nama: "الكهف", namaLatin: "Al-Kahf", arti: "Gua", jumlahAyat: 110, tempatTurun: "Makkiyah", juzMulai: 15 },
  { nomor: 19, nama: "مريم", namaLatin: "Maryam", arti: "Maryam", jumlahAyat: 98, tempatTurun: "Makkiyah", juzMulai: 16 },
  { nomor: 20, nama: "طه", namaLatin: "Taha", arti: "Taha", jumlahAyat: 135, tempatTurun: "Makkiyah", juzMulai: 16 },
  { nomor: 21, nama: "الأنبياء", namaLatin: "Al-Anbiya'", arti: "Para Nabi", jumlahAyat: 112, tempatTurun: "Makkiyah", juzMulai: 17 },
  { nomor: 22, nama: "الحج", namaLatin: "Al-Hajj", arti: "Haji", jumlahAyat: 78, tempatTurun: "Madaniyah", juzMulai: 17 },
  { nomor: 23, nama: "المؤمنون", namaLatin: "Al-Mu'minun", arti: "Orang-Orang Mukmin", jumlahAyat: 118, tempatTurun: "Makkiyah", juzMulai: 18 },
  { nomor: 24, nama: "النور", namaLatin: "An-Nur", arti: "Cahaya", jumlahAyat: 64, tempatTurun: "Madaniyah", juzMulai: 18 },
  { nomor: 25, nama: "الفرقان", namaLatin: "Al-Furqan", arti: "Pembeda", jumlahAyat: 77, tempatTurun: "Makkiyah", juzMulai: 18 },
  { nomor: 26, nama: "الشعراء", namaLatin: "Asy-Syu'ara'", arti: "Para Penyair", jumlahAyat: 227, tempatTurun: "Makkiyah", juzMulai: 19 },
  { nomor: 27, nama: "النمل", namaLatin: "An-Naml", arti: "Semut", jumlahAyat: 93, tempatTurun: "Makkiyah", juzMulai: 19 },
  { nomor: 28, nama: "القصص", namaLatin: "Al-Qasas", arti: "Kisah-Kisah", jumlahAyat: 88, tempatTurun: "Makkiyah", juzMulai: 20 },
  { nomor: 29, nama: "العنكبوت", namaLatin: "Al-'Ankabut", arti: "Laba-Laba", jumlahAyat: 69, tempatTurun: "Makkiyah", juzMulai: 20 },
  { nomor: 30, nama: "الروم", namaLatin: "Ar-Rum", arti: "Bangsa Romawi", jumlahAyat: 60, tempatTurun: "Makkiyah", juzMulai: 21 },
  { nomor: 31, nama: "لقمان", namaLatin: "Luqman", arti: "Luqman", jumlahAyat: 34, tempatTurun: "Makkiyah", juzMulai: 21 },
  { nomor: 32, nama: "السجدة", namaLatin: "As-Sajdah", arti: "Sujud", jumlahAyat: 30, tempatTurun: "Makkiyah", juzMulai: 21 },
  { nomor: 33, nama: "الأحزاب", namaLatin: "Al-Ahzab", arti: "Golongan yang Bersekutu", jumlahAyat: 73, tempatTurun: "Madaniyah", juzMulai: 21 },
  { nomor: 34, nama: "سبأ", namaLatin: "Saba'", arti: "Kaum Saba'", jumlahAyat: 54, tempatTurun: "Makkiyah", juzMulai: 22 },
  { nomor: 35, nama: "فاطر", namaLatin: "Fatir", arti: "Pencipta", jumlahAyat: 45, tempatTurun: "Makkiyah", juzMulai: 22 },
  { nomor: 36, nama: "يس", namaLatin: "Yasin", arti: "Yasin", jumlahAyat: 83, tempatTurun: "Makkiyah", juzMulai: 22 },
  { nomor: 37, nama: "الصافات", namaLatin: "As-Saffat", arti: "Barisan-Barisan", jumlahAyat: 182, tempatTurun: "Makkiyah", juzMulai: 23 },
  { nomor: 38, nama: "ص", namaLatin: "Sad", arti: "Sad", jumlahAyat: 88, tempatTurun: "Makkiyah", juzMulai: 23 },
  { nomor: 39, nama: "الزمر", namaLatin: "Az-Zumar", arti: "Rombongan", jumlahAyat: 75, tempatTurun: "Makkiyah", juzMulai: 23 },
  { nomor: 40, nama: "غافر", namaLatin: "Gafir", arti: "Maha Pengampun", jumlahAyat: 85, tempatTurun: "Makkiyah", juzMulai: 24 },
  { nomor: 41, nama: "فصلت", namaLatin: "Fussilat", arti: "Yang Dijelaskan", jumlahAyat: 54, tempatTurun: "Makkiyah", juzMulai: 24 },
  { nomor: 42, nama: "الشورى", namaLatin: "Asy-Syura", arti: "Musyawarah", jumlahAyat: 53, tempatTurun: "Makkiyah", juzMulai: 25 },
  { nomor: 43, nama: "الزخرف", namaLatin: "Az-Zukhruf", arti: "Perhiasan", jumlahAyat: 89, tempatTurun: "Makkiyah", juzMulai: 25 },
  { nomor: 44, nama: "الدخان", namaLatin: "Ad-Dukhan", arti: "Kabut Asap", jumlahAyat: 59, tempatTurun: "Makkiyah", juzMulai: 25 },
  { nomor: 45, nama: "الجاثية", namaLatin: "Al-Jasiyah", arti: "Berlutut", jumlahAyat: 37, tempatTurun: "Makkiyah", juzMulai: 25 },
  { nomor: 46, nama: "الأحقاف", namaLatin: "Al-Ahqaf", arti: "Bukit-Bukit Pasir", jumlahAyat: 35, tempatTurun: "Makkiyah", juzMulai: 26 },
  { nomor: 47, nama: "محمد", namaLatin: "Muhammad", arti: "Nabi Muhammad", jumlahAyat: 38, tempatTurun: "Madaniyah", juzMulai: 26 },
  { nomor: 48, nama: "الفتح", namaLatin: "Al-Fath", arti: "Kemenangan", jumlahAyat: 29, tempatTurun: "Madaniyah", juzMulai: 26 },
  { nomor: 49, nama: "الحجرات", namaLatin: "Al-Hujurat", arti: "Kamar-Kamar", jumlahAyat: 18, tempatTurun: "Madaniyah", juzMulai: 26 },
  { nomor: 50, nama: "ق", namaLatin: "Qaf", arti: "Qaf", jumlahAyat: 45, tempatTurun: "Makkiyah", juzMulai: 26 },
  { nomor: 51, nama: "الذاريات", namaLatin: "Az-Zariyat", arti: "Angin yang Menerbangkan", jumlahAyat: 60, tempatTurun: "Makkiyah", juzMulai: 26 },
  { nomor: 52, nama: "الطور", namaLatin: "At-Tur", arti: "Bukit Tursina", jumlahAyat: 49, tempatTurun: "Makkiyah", juzMulai: 27 },
  { nomor: 53, nama: "النجم", namaLatin: "An-Najm", arti: "Bintang", jumlahAyat: 62, tempatTurun: "Makkiyah", juzMulai: 27 },
  { nomor: 54, nama: "القمر", namaLatin: "Al-Qamar", arti: "Bulan", jumlahAyat: 55, tempatTurun: "Makkiyah", juzMulai: 27 },
  { nomor: 55, nama: "الرحمن", namaLatin: "Ar-Rahman", arti: "Maha Pengasih", jumlahAyat: 78, tempatTurun: "Madaniyah", juzMulai: 27 },
  { nomor: 56, nama: "الواقعة", namaLatin: "Al-Waqi'ah", arti: "Hari Kiamat", jumlahAyat: 96, tempatTurun: "Makkiyah", juzMulai: 27 },
  { nomor: 57, nama: "الحديد", namaLatin: "Al-Hadid", arti: "Besi", jumlahAyat: 29, tempatTurun: "Madaniyah", juzMulai: 27 },
  { nomor: 58, nama: "المجادلة", namaLatin: "Al-Mujadalah", arti: "Wanita yang Mengajukan Gugatan", jumlahAyat: 22, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 59, nama: "الحشر", namaLatin: "Al-Hasyr", arti: "Pengusiran", jumlahAyat: 24, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 60, nama: "الممتحنة", namaLatin: "Al-Mumtahanah", arti: "Wanita yang Diuji", jumlahAyat: 13, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 61, nama: "الصف", namaLatin: "As-Saff", arti: "Barisan", jumlahAyat: 14, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 62, nama: "الجمعة", namaLatin: "Al-Jumu'ah", arti: "Hari Jumat", jumlahAyat: 11, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 63, nama: "المنافقون", namaLatin: "Al-Munafiqun", arti: "Orang-Orang Munafik", jumlahAyat: 11, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 64, nama: "التغابن", namaLatin: "At-Tagabun", arti: "Hari Ditampakkan Kesalahan", jumlahAyat: 18, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 65, nama: "الطلاق", namaLatin: "At-Talaq", arti: "Talak", jumlahAyat: 12, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 66, nama: "التحريم", namaLatin: "At-Tahrim", arti: "Pengharaman", jumlahAyat: 12, tempatTurun: "Madaniyah", juzMulai: 28 },
  { nomor: 67, nama: "الملك", namaLatin: "Al-Mulk", arti: "Kerajaan", jumlahAyat: 30, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 68, nama: "القلم", namaLatin: "Al-Qalam", arti: "Pena", jumlahAyat: 52, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 69, nama: "الحاقة", namaLatin: "Al-Haqqah", arti: "Hari Kiamat", jumlahAyat: 52, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 70, nama: "المعارج", namaLatin: "Al-Ma'arij", arti: "Tempat-Tempat Naik", jumlahAyat: 44, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 71, nama: "نوح", namaLatin: "Nuh", arti: "Nabi Nuh", jumlahAyat: 28, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 72, nama: "الجن", namaLatin: "Al-Jinn", arti: "Jin", jumlahAyat: 28, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 73, nama: "المزمل", namaLatin: "Al-Muzzammil", arti: "Orang yang Berselimut", jumlahAyat: 20, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 74, nama: "المدثر", namaLatin: "Al-Muddassir", arti: "Orang yang Berkemul", jumlahAyat: 56, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 75, nama: "القيامة", namaLatin: "Al-Qiyamah", arti: "Hari Kiamat", jumlahAyat: 40, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 76, nama: "الإنسان", namaLatin: "Al-Insan", arti: "Manusia", jumlahAyat: 31, tempatTurun: "Madaniyah", juzMulai: 29 },
  { nomor: 77, nama: "المرسلات", namaLatin: "Al-Mursalat", arti: "Malaikat yang Diutus", jumlahAyat: 50, tempatTurun: "Makkiyah", juzMulai: 29 },
  { nomor: 78, nama: "النبأ", namaLatin: "An-Naba'", arti: "Berita Besar", jumlahAyat: 40, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 79, nama: "النازعات", namaLatin: "An-Nazi'at", arti: "Malaikat yang Mencabut", jumlahAyat: 46, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 80, nama: "عبس", namaLatin: "'Abasa", arti: "Ia Bermuka Masam", jumlahAyat: 42, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 81, nama: "التكوير", namaLatin: "At-Takwir", arti: "Menggulung", jumlahAyat: 29, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 82, nama: "الإنفطار", namaLatin: "Al-Infitar", arti: "Terbelah", jumlahAyat: 19, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 83, nama: "المطففين", namaLatin: "Al-Mutaffifin", arti: "Orang-Orang yang Curang", jumlahAyat: 36, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 84, nama: "الإنشقاق", namaLatin: "Al-Insyiqaq", arti: "Terbelah", jumlahAyat: 25, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 85, nama: "البروج", namaLatin: "Al-Buruj", arti: "Gugusan Bintang", jumlahAyat: 22, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 86, nama: "الطارق", namaLatin: "At-Tariq", arti: "Yang Datang di Malam Hari", jumlahAyat: 17, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 87, nama: "الأعلى", namaLatin: "Al-A'la", arti: "Yang Paling Tinggi", jumlahAyat: 19, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 88, nama: "الغاشية", namaLatin: "Al-Gasyiyah", arti: "Hari Pembalasan", jumlahAyat: 26, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 89, nama: "الفجر", namaLatin: "Al-Fajr", arti: "Fajar", jumlahAyat: 30, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 90, nama: "البلد", namaLatin: "Al-Balad", arti: "Negeri", jumlahAyat: 20, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 91, nama: "الشمس", namaLatin: "Asy-Syams", arti: "Matahari", jumlahAyat: 15, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 92, nama: "الليل", namaLatin: "Al-Lail", arti: "Malam", jumlahAyat: 21, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 93, nama: "الضحى", namaLatin: "Ad-Duha", arti: "Waktu Duha", jumlahAyat: 11, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 94, nama: "الشرح", namaLatin: "Asy-Syarh", arti: "Melapangkan", jumlahAyat: 8, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 95, nama: "التين", namaLatin: "At-Tin", arti: "Buah Tin", jumlahAyat: 8, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 96, nama: "العلق", namaLatin: "Al-'Alaq", arti: "Segumpal Darah", jumlahAyat: 19, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 97, nama: "القدر", namaLatin: "Al-Qadr", arti: "Kemuliaan", jumlahAyat: 5, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 98, nama: "البينة", namaLatin: "Al-Bayyinah", arti: "Bukti Nyata", jumlahAyat: 8, tempatTurun: "Madaniyah", juzMulai: 30 },
  { nomor: 99, nama: "الزلزلة", namaLatin: "Az-Zalzalah", arti: "Guncangan", jumlahAyat: 8, tempatTurun: "Madaniyah", juzMulai: 30 },
  { nomor: 100, nama: "العاديات", namaLatin: "Al-'Adiyat", arti: "Kuda Perang yang Berlari Kencang", jumlahAyat: 11, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 101, nama: "القارعة", namaLatin: "Al-Qari'ah", arti: "Hari Kiamat", jumlahAyat: 11, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 102, nama: "التكاثر", namaLatin: "At-Takasur", arti: "Bermegah-Megahan", jumlahAyat: 8, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 103, nama: "العصر", namaLatin: "Al-'Asr", arti: "Masa", jumlahAyat: 3, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 104, nama: "الهمزة", namaLatin: "Al-Humazah", arti: "Pengumpat", jumlahAyat: 9, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 105, nama: "الفيل", namaLatin: "Al-Fil", arti: "Gajah", jumlahAyat: 5, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 106, nama: "قريش", namaLatin: "Quraisy", arti: "Suku Quraisy", jumlahAyat: 4, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 107, nama: "الماعون", namaLatin: "Al-Ma'un", arti: "Barang yang Berguna", jumlahAyat: 7, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 108, nama: "الكوثر", namaLatin: "Al-Kausar", arti: "Nikmat yang Banyak", jumlahAyat: 3, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 109, nama: "الكافرون", namaLatin: "Al-Kafirun", arti: "Orang-Orang Kafir", jumlahAyat: 6, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 110, nama: "النصر", namaLatin: "An-Nasr", arti: "Pertolongan", jumlahAyat: 3, tempatTurun: "Madaniyah", juzMulai: 30 },
  { nomor: 111, nama: "المسد", namaLatin: "Al-Masad", arti: "Gejolak Api / Sabut", jumlahAyat: 5, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 112, nama: "الإخلاص", namaLatin: "Al-Ikhlas", arti: "Ikhlas / Memurnikan Keesaan Allah", jumlahAyat: 4, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 113, nama: "الفلق", namaLatin: "Al-Falaq", arti: "Waktu Subuh", jumlahAyat: 5, tempatTurun: "Makkiyah", juzMulai: 30 },
  { nomor: 114, nama: "الناس", namaLatin: "An-Nas", arti: "Manusia", jumlahAyat: 6, tempatTurun: "Makkiyah", juzMulai: 30 },
] as const;

// Peta cepat berdasarkan nomor surat
export const SURAT_BY_NOMOR: Record<number, Surat> = Object.fromEntries(
  DAFTAR_SURAT.map((s) => [s.nomor, s])
) as Record<number, Surat>;

/** Cari surat berdasarkan nama latin (tidak peka huruf besar/kecil, tanda baca diabaikan). */
export function cariSurat(nama: string): Surat | undefined {
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z]/g, "");
  const target = norm(nama);
  return DAFTAR_SURAT.find((s) => norm(s.namaLatin) === target);
}

/**
 * Batas awal tiap juz dalam bentuk [nomorSurat, ayat].
 * Riwayat Hafs, mushaf standar Madinah/Kemenag.
 * Indeks 0 = juz 1, indeks 29 = juz 30.
 */
export const AWAL_JUZ: readonly [number, number][] = [
  [1, 1],  // Juz 1
  [2, 142],  // Juz 2
  [2, 253],  // Juz 3
  [3, 93],  // Juz 4
  [4, 24],  // Juz 5
  [4, 148],  // Juz 6
  [5, 82],  // Juz 7
  [6, 111],  // Juz 8
  [7, 88],  // Juz 9
  [8, 41],  // Juz 10
  [9, 93],  // Juz 11
  [11, 6],  // Juz 12
  [12, 53],  // Juz 13
  [15, 1],  // Juz 14
  [17, 1],  // Juz 15
  [18, 75],  // Juz 16
  [21, 1],  // Juz 17
  [23, 1],  // Juz 18
  [25, 21],  // Juz 19
  [27, 56],  // Juz 20
  [29, 46],  // Juz 21
  [33, 31],  // Juz 22
  [36, 28],  // Juz 23
  [39, 32],  // Juz 24
  [41, 47],  // Juz 25
  [46, 1],  // Juz 26
  [51, 31],  // Juz 27
  [58, 1],  // Juz 28
  [67, 1],  // Juz 29
  [78, 1],  // Juz 30
] as const;

/**
 * Menghitung juz dari nomor surat + ayat.
 * Berguna saat guru mengisi setoran: cukup pilih surat & ayat,
 * juz terisi otomatis sehingga konsisten.
 *
 * @returns nomor juz 1-30, atau null bila input tidak valid.
 */
export function hitungJuz(nomorSurat: number, ayat: number): number | null {
  const surat = SURAT_BY_NOMOR[nomorSurat];
  if (!surat || ayat < 1 || ayat > surat.jumlahAyat) return null;

  // Cari juz terakhir yang batas awalnya <= posisi (surat, ayat)
  let hasil = 1;
  for (let i = 0; i < AWAL_JUZ.length; i++) {
    const [s, a] = AWAL_JUZ[i];
    if (nomorSurat > s || (nomorSurat === s && ayat >= a)) {
      hasil = i + 1;
    } else {
      break;
    }
  }
  return hasil;
}

/** Daftar surat yang (sebagian atau seluruhnya) berada di juz tertentu. */
export function suratDalamJuz(juz: number): Surat[] {
  if (juz < 1 || juz > 30) return [];
  const [sAwal, aAwal] = AWAL_JUZ[juz - 1];
  const [sAkhir, aAkhir] =
    juz < 30 ? AWAL_JUZ[juz] : [114, SURAT_BY_NOMOR[114].jumlahAyat];
  void aAwal; void aAkhir;
  return DAFTAR_SURAT.filter((s) => s.nomor >= sAwal && s.nomor <= sAkhir);
}
