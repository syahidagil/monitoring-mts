import { DAFTAR_SURAT, hitungJuz } from "@/lib/quran/surat";

/** Total ayat Al-Qur'an (hitungan Kufah/Hafs, standar Kemenag RI) = 6.236 ayat. */
export const TOTAL_AYAT_QURAN = DAFTAR_SURAT.reduce((sum, s) => sum + s.jumlahAyat, 0);

/**
 * Offset ayat global (indeks 0-based) di awal tiap surat, dipakai untuk
 * menghasilkan nomor ayat unik lintas seluruh Al-Qur'an - supaya ayat
 * "Al-Baqarah ayat 5" dan "Ali 'Imran ayat 5" tidak dianggap ayat yang sama.
 */
const OFFSET_AWAL_SURAT: Record<number, number> = (() => {
  const offset: Record<number, number> = {};
  let running = 0;
  for (const s of DAFTAR_SURAT) {
    offset[s.nomor] = running;
    running += s.jumlahAyat;
  }
  return offset;
})();

const JUMLAH_AYAT: Record<number, number> = Object.fromEntries(
  DAFTAR_SURAT.map((s) => [s.nomor, s.jumlahAyat])
);

function ayatGlobal(nomorSurat: number, ayat: number): number {
  return OFFSET_AWAL_SURAT[nomorSurat] + ayat;
}

/** Jumlah ayat pada tiap juz (indeks 0 = juz 1), dihitung dari batas juz di surat.ts. */
const AYAT_PER_JUZ: number[] = (() => {
  const hasil: number[] = new Array(30).fill(0);
  for (const s of DAFTAR_SURAT) {
    for (let a = 1; a <= s.jumlahAyat; a++) {
      const juz = hitungJuz(s.nomor, a);
      if (juz) hasil[juz - 1] += 1;
    }
  }
  return hasil;
})();

/** Jumlah ayat pada suatu juz (1-30); 0 jika nomor juz tidak valid. */
export function totalAyatJuz(juz: number): number {
  return AYAT_PER_JUZ[juz - 1] ?? 0;
}

function waktu(t: Date | string): number {
  const ms = new Date(t).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export interface HafalanRecordMinimal {
  /** Dipakai sebagai pembeda urutan untuk evaluasi yang tanggalnya sama. */
  id: number;
  /** Dipakai untuk mengurutkan evaluasi dari yang paling lama ke yang terbaru. */
  tanggal: Date | string;
  nomorSurat: number | null;
  ayatMulai: number | null;
  ayatSelesai: number | null;
  nilai: "L" | "L_MIN";
}

export interface ProgresJuz {
  juz: number;
  /** Ayat pada juz ini yang evaluasi terbarunya bernilai L. */
  ayatBerhasil: number;
  /** Jumlah seluruh ayat pada juz ini (pembagi persentase). */
  totalAyat: number;
  /** 0-100, dibulatkan 1 desimal: ayatBerhasil / totalAyat. */
  persentase: number;
  /** True jika pernah ada setoran yang menyentuh juz ini (apa pun nilainya). */
  adaSetoran: boolean;
}

export interface ProgresHafalanResult {
  /** Jumlah ayat unik yang evaluasi terbarunya bernilai L (tanpa dobel hitung rentang tumpang tindih). */
  totalAyatBerhasil: number;
  totalAyatQuran: number;
  /** Persentase terhadap SELURUH Al-Qur'an, 0-100, dibulatkan 1 desimal (ringkasan). */
  persentase: number;
  /** Jumlah rentang setoran (bukan ayat) yang seluruh ayatnya sudah dinyatakan berhasil. */
  jumlahRentangBerhasil: number;
  /** Rentang yang sudah diinput tapi masih ada ayat yang evaluasi terbarunya L-. */
  jumlahRentangBelumTuntas: number;
  /** Progres tiap juz (30 entri, juz 1 sampai 30). */
  perJuz: ProgresJuz[];
  /** Juz dari setoran terbaru, untuk tampilan awal grafik; null jika belum ada setoran. */
  juzAktif: number | null;
  /** Jumlah juz yang seluruh ayatnya sudah berhasil (100%). */
  jumlahJuzTuntas: number;
}

/**
 * Hitung progres hafalan siswa, total dan PER JUZ.
 *
 * Aturan:
 * - Setiap setoran memberi nilai pada ayat-ayat di rentangnya.
 * - Status sebuah ayat ditentukan oleh evaluasi TERBARU yang mencakup ayat itu
 *   (urut menurut tanggal, lalu id untuk tanggal yang sama).
 *   Jadi ayat yang sempat L- lalu diulang dan mendapat L ikut dihitung,
 *   sedangkan ayat yang evaluasi terbarunya L- tidak dihitung sampai diulang dan lulus.
 * - Ayat dari rentang yang overlap dihitung sekali saja (kunci ayat unik lintas surat).
 * - Persentase per juz = ayat berhasil pada juz itu / jumlah ayat juz itu.
 *   Rentang yang melewati batas juz otomatis terbagi ke juz masing-masing.
 * - Record lama yang belum punya nomorSurat/ayatMulai/ayatSelesai otomatis
 *   diabaikan dari kalkulasi - bukan dianggap gagal.
 */
export function hitungProgresHafalan(
  records: HafalanRecordMinimal[]
): ProgresHafalanResult {
  const valid = records.filter(
    (r) => r.nomorSurat != null && r.ayatMulai != null && r.ayatSelesai != null
  );

  // Urutkan dari paling lama ke paling baru; tanggal sama -> id lebih kecil dulu.
  const urut = [...valid].sort(
    (a, b) => waktu(a.tanggal) - waktu(b.tanggal) || a.id - b.id
  );

  // Status akhir tiap ayat = nilai dari evaluasi terbaru yang mencakup ayat itu.
  const statusAyat = new Map<number, { nilai: "L" | "L_MIN"; juz: number }>();
  const juzTersentuh = new Set<number>();
  for (const r of urut) {
    // Batasi ke jumlah ayat surat tsb, supaya data tak wajar tidak menggeser ke surat lain.
    const akhir = Math.min(r.ayatSelesai!, JUMLAH_AYAT[r.nomorSurat!] ?? 0);
    for (let a = r.ayatMulai!; a <= akhir; a++) {
      const juz = hitungJuz(r.nomorSurat!, a);
      if (!juz) continue;
      statusAyat.set(ayatGlobal(r.nomorSurat!, a), { nilai: r.nilai, juz });
      juzTersentuh.add(juz);
    }
  }

  const berhasilPerJuz: number[] = new Array(30).fill(0);
  let totalAyatBerhasil = 0;
  for (const s of statusAyat.values()) {
    if (s.nilai === "L") {
      berhasilPerJuz[s.juz - 1] += 1;
      totalAyatBerhasil += 1;
    }
  }

  const perJuz: ProgresJuz[] = AYAT_PER_JUZ.map((total, i) => ({
    juz: i + 1,
    ayatBerhasil: berhasilPerJuz[i],
    totalAyat: total,
    persentase: total > 0 ? Math.round((berhasilPerJuz[i] / total) * 1000) / 10 : 0,
    adaSetoran: juzTersentuh.has(i + 1),
  }));

  const jumlahJuzTuntas = perJuz.filter(
    (j) => j.totalAyat > 0 && j.ayatBerhasil === j.totalAyat
  ).length;

  const terakhir = urut.length > 0 ? urut[urut.length - 1] : null;
  const juzAktif = terakhir
    ? hitungJuz(terakhir.nomorSurat!, terakhir.ayatMulai!)
    : null;

  // Hitung jumlah rentang (nomorSurat + ayatMulai + ayatSelesai yang identik) untuk konteks UI.
  const rentang = new Map<string, HafalanRecordMinimal>();
  for (const r of valid) {
    const key = `${r.nomorSurat}:${r.ayatMulai}:${r.ayatSelesai}`;
    if (!rentang.has(key)) rentang.set(key, r);
  }

  let jumlahRentangBerhasil = 0;
  let jumlahRentangBelumTuntas = 0;
  for (const r of rentang.values()) {
    const akhir = Math.min(r.ayatSelesai!, JUMLAH_AYAT[r.nomorSurat!] ?? 0);
    let tuntas = true;
    for (let a = r.ayatMulai!; a <= akhir; a++) {
      if (statusAyat.get(ayatGlobal(r.nomorSurat!, a))?.nilai !== "L") {
        tuntas = false;
        break;
      }
    }
    if (tuntas) jumlahRentangBerhasil += 1;
    else jumlahRentangBelumTuntas += 1;
  }

  const persentase = Math.round((totalAyatBerhasil / TOTAL_AYAT_QURAN) * 1000) / 10;

  return {
    totalAyatBerhasil,
    totalAyatQuran: TOTAL_AYAT_QURAN,
    persentase,
    jumlahRentangBerhasil,
    jumlahRentangBelumTuntas,
    perJuz,
    juzAktif,
    jumlahJuzTuntas,
  };
}