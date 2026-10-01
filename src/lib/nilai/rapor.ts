// Skema penilaian rapor MTs Al-Amin Bintaro:
//   PH  (Penilaian Harian)      = rata-rata Tugas, Ulangan Harian, PR, dan UTS -> bobot 67%
//   PAT (Penilaian Akhir Tahun/Semester) = nilai UAS                          -> bobot 33%
//
// File ini dipakai baik dari server (Server Action) maupun langsung di
// komponen client (chart) supaya rumusnya SATU tempat saja -- tidak ada
// risiko rekap guru, chart, dan halaman orang tua menghitung dengan cara
// berbeda-beda.

export type JenisNilaiKey = "TUGAS" | "HARIAN" | "PR" | "UTS" | "UAS";

export const JENIS_PH: readonly JenisNilaiKey[] = ["TUGAS", "HARIAN", "PR", "UTS"];
export const JENIS_PAT: readonly JenisNilaiKey[] = ["UAS"];

export const BOBOT_PH = 0.67;
export const BOBOT_PAT = 0.33;

export interface NilaiEntryMinimal {
  jenis: string;
  nilai: number;
}

export interface HasilNilaiRapor {
  /** Rata-rata seluruh nilai PH (Tugas/Harian/PR/UTS). Null kalau belum ada nilai PH sama sekali. */
  rataPH: number | null;
  /** Nilai PAT (UAS). Kalau UAS sampai diinput lebih dari sekali, dirata-ratakan. Null kalau UAS belum diisi. */
  nilaiPAT: number | null;
  /** Nilai akhir sesuai bobot 67/33. */
  nilaiAkhir: number | null;
  /** false kalau PAT (UAS) belum diisi -> nilaiAkhir di atas masih SEMENTARA (murni dari PH). */
  lengkap: boolean;
}

function bulat1(n: number): number {
  return Math.round(n * 10) / 10;
}

function rataRata(vals: number[]): number | null {
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

/**
 * Hitung nilai akhir dari kumpulan entri nilai satu siswa untuk SATU mata
 * pelajaran & satu semester. Entri dari jenis lain di luar TUGAS/HARIAN/PR/UTS/UAS
 * (kalau ada) diabaikan dari kalkulasi ini.
 */
export function hitungNilaiRapor(entries: NilaiEntryMinimal[]): HasilNilaiRapor {
  const phVals = entries
    .filter((e) => (JENIS_PH as string[]).includes(e.jenis))
    .map((e) => e.nilai);
  const patVals = entries
    .filter((e) => (JENIS_PAT as string[]).includes(e.jenis))
    .map((e) => e.nilai);

  const rPH = rataRata(phVals);
  const rPAT = rataRata(patVals);

  let nilaiAkhir: number | null = null;
  let lengkap = false;

  if (rPH !== null && rPAT !== null) {
    nilaiAkhir = rPH * BOBOT_PH + rPAT * BOBOT_PAT;
    lengkap = true;
  } else if (rPH !== null) {
    // UAS belum diisi -> tampilkan nilai sementara dari PH saja, jangan 0.
    nilaiAkhir = rPH;
  } else if (rPAT !== null) {
    // Kasus jarang: UAS sudah ada tapi PH belum sama sekali.
    nilaiAkhir = rPAT;
  }

  return {
    rataPH: rPH !== null ? bulat1(rPH) : null,
    nilaiPAT: rPAT !== null ? bulat1(rPAT) : null,
    nilaiAkhir: nilaiAkhir !== null ? bulat1(nilaiAkhir) : null,
    lengkap,
  };
}
