import { DAFTAR_SURAT } from "@/lib/quran/surat";

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

export interface HafalanRecordMinimal {
  nomorSurat: number | null;
  ayatMulai: number | null;
  ayatSelesai: number | null;
  nilai: "L" | "L_MIN";
}

export interface ProgresHafalanResult {
  /** Jumlah ayat unik yang sudah "berhasil" dihafal (lulus semua evaluasi, tanpa L-, tanpa dobel hitung rentang tumpang tindih). */
  totalAyatBerhasil: number;
  totalAyatQuran: number;
  /** 0-100, dibulatkan 1 desimal. */
  persentase: number;
  /** Jumlah rentang setoran (bukan ayat) yang dinyatakan sukses - buat konteks tambahan di UI. */
  jumlahRentangBerhasil: number;
  /** Rentang yang sudah diinput tapi belum lolos kriteria sukses (masih ada L- di dalamnya, atau evaluasi belum lengkap). */
  jumlahRentangBelumTuntas: number;
}

/**
 * Hitung persentase ayat Al-Qur'an yang berhasil dihafal siswa.
 *
 * Aturan:
 * - Kelompokkan setoran per rentang (nomorSurat + ayatMulai + ayatSelesai) yang identik -
 *   ini mewakili beberapa kali evaluasi untuk rentang ayat yang sama (mis. setoran + murajaah).
 * - Rentang dihitung BERHASIL hanya jika SEMUA evaluasi pada rentang itu bernilai "L".
 *   Kalau ada satu saja "L_MIN" di rentang tsb, seluruh rentang itu tidak dihitung.
 * - Record lama yang belum punya nomorSurat/ayatMulai/ayatSelesai (sebelum migrasi field ini
 *   ditambahkan) otomatis diabaikan dari kalkulasi persentase - bukan dianggap gagal.
 * - Ayat dari rentang-rentang yang overlap di-dedup di level ayat individual (pakai Set),
 *   jadi tidak dihitung dobel.
 */
export function hitungProgresHafalan(
  records: HafalanRecordMinimal[]
): ProgresHafalanResult {
  const valid = records.filter(
    (r) => r.nomorSurat != null && r.ayatMulai != null && r.ayatSelesai != null
  );

  const groups = new Map<string, HafalanRecordMinimal[]>();
  for (const r of valid) {
    const key = `${r.nomorSurat}:${r.ayatMulai}:${r.ayatSelesai}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const ayatBerhasil = new Set<number>();
  let jumlahRentangBerhasil = 0;
  let jumlahRentangBelumTuntas = 0;

  for (const group of groups.values()) {
    const semuaLulus = group.every((r) => r.nilai === "L");
    const { nomorSurat, ayatMulai, ayatSelesai } = group[0];

    if (!semuaLulus) {
      jumlahRentangBelumTuntas += 1;
      continue;
    }
    jumlahRentangBerhasil += 1;
    // Batasi ke jumlah ayat surat tsb, supaya data tak wajar tidak menggeser ke surat lain.
    const akhir = Math.min(ayatSelesai!, JUMLAH_AYAT[nomorSurat!] ?? 0);
    for (let a = ayatMulai!; a <= akhir; a++) {
      ayatBerhasil.add(ayatGlobal(nomorSurat!, a));
    }
  }

  const totalAyatBerhasil = ayatBerhasil.size;
  const persentase = Math.round((totalAyatBerhasil / TOTAL_AYAT_QURAN) * 1000) / 10;

  return {
    totalAyatBerhasil,
    totalAyatQuran: TOTAL_AYAT_QURAN,
    persentase,
    jumlahRentangBerhasil,
    jumlahRentangBelumTuntas,
  };
}