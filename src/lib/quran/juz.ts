import { AWAL_JUZ, SURAT_BY_NOMOR } from "@/lib/quran/surat";

export interface SuratDiJuz {
  nomor: number;
  namaLatin: string;
  /** Jumlah ayat seluruh surat. */
  jumlahAyat: number;
  /** Ayat pertama surat ini yang berada di juz tersebut. */
  ayatMulai: number;
  /** Ayat terakhir surat ini yang berada di juz tersebut. */
  ayatSelesai: number;
  /** True jika hanya sebagian surat yang berada di juz ini (surat lintas juz). */
  sebagian: boolean;
}

const cache = new Map<number, SuratDiJuz[]>();

/**
 * Daftar surat yang berada (seluruhnya atau sebagian) pada suatu juz,
 * lengkap dengan rentang ayat surat itu di juz tersebut.
 * Surat yang melintasi beberapa juz muncul di setiap juz yang memuatnya.
 * Dihitung dari batas awal juz (AWAL_JUZ) di surat.ts.
 */
export function daftarSuratDiJuz(juz: number): SuratDiJuz[] {
  if (!Number.isInteger(juz) || juz < 1 || juz > 30) return [];

  const tersimpan = cache.get(juz);
  if (tersimpan) return tersimpan;

  const [suratAwal, ayatAwal] = AWAL_JUZ[juz - 1];
  // Batas awal juz berikutnya (untuk juz 30: satu ayat setelah ayat terakhir An-Nas)
  const [suratBerikut, ayatBerikut]: readonly [number, number] =
    juz < 30 ? AWAL_JUZ[juz] : [114, SURAT_BY_NOMOR[114].jumlahAyat + 1];

  const hasil: SuratDiJuz[] = [];
  for (let nomor = suratAwal; nomor <= suratBerikut; nomor++) {
    const surat = SURAT_BY_NOMOR[nomor];
    const ayatMulai = nomor === suratAwal ? ayatAwal : 1;
    const ayatSelesai = nomor === suratBerikut ? ayatBerikut - 1 : surat.jumlahAyat;
    // Juz berikutnya dimulai tepat di ayat 1 surat ini, jadi surat ini bukan bagian juz ini
    if (ayatSelesai < ayatMulai) continue;

    hasil.push({
      nomor,
      namaLatin: surat.namaLatin,
      jumlahAyat: surat.jumlahAyat,
      ayatMulai,
      ayatSelesai,
      sebagian: ayatMulai !== 1 || ayatSelesai !== surat.jumlahAyat,
    });
  }

  cache.set(juz, hasil);
  return hasil;
}

/** Rentang ayat sebuah surat pada juz tertentu; null jika surat itu tidak ada di juz tersebut. */
export function rentangAyatDiJuz(
  juz: number,
  nomorSurat: number
): { mulai: number; selesai: number } | null {
  const surat = daftarSuratDiJuz(juz).find((s) => s.nomor === nomorSurat);
  return surat ? { mulai: surat.ayatMulai, selesai: surat.ayatSelesai } : null;
}