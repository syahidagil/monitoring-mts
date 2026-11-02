/**
 * Tabel jam pelajaran MTs Al-Amin Bintaro.
 * Sumber: Jadwal Pelajaran semester Ganjil 2025/2026 (1 jam pelajaran = 40 menit).
 * Tiap hari punya pola sendiri (jumlah JP dan waktu istirahat).
 *
 * Jika jadwal sekolah berubah, UBAH HANYA BAGIAN "KONFIGURASI".
 * Dropdown di form jadwal admin dan validasi di server membaca file ini.
 */

// ===================== KONFIGURASI =====================
/** Lama 1 jam pelajaran (menit). */
export const DURASI_JP_MENIT = 40;
/** Kegiatan sebelum JP ke-1 (bukan jam pelajaran, tidak bisa dipilih di jadwal). */
export const KEGIATAN_AWAL = { mulai: "07:00", selesai: "07:30" };
/** JP ke-1 dimulai pada jam ini. */
export const JAM_PERTAMA = "07:30";

export type NamaHari = "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU";

type PolaHari = {
  /** Kegiatan pembuka pukul 07.00-07.30. */
  kegiatanAwal: string;
  /** Jumlah jam pelajaran pada hari itu. */
  jumlahJp: number;
  /** Istirahat: berlangsung `menit` menit setelah JP ke-`setelahJp`. */
  istirahat: { setelahJp: number; menit: number }[];
};

const ISTIRAHAT_NORMAL = [{ setelahJp: 4, menit: 20 }]; // 10.10 - 10.30

export const POLA_HARI: Record<NamaHari, PolaHari> = {
  SENIN:  { kegiatanAwal: "Upacara Bendera",   jumlahJp: 8, istirahat: ISTIRAHAT_NORMAL },
  SELASA: { kegiatanAwal: "Tadarus Al-Qur'an", jumlahJp: 8, istirahat: ISTIRAHAT_NORMAL },
  RABU:   { kegiatanAwal: "Tadarus Al-Qur'an", jumlahJp: 8, istirahat: ISTIRAHAT_NORMAL },
  KAMIS:  { kegiatanAwal: "Tadarus Al-Qur'an", jumlahJp: 9, istirahat: ISTIRAHAT_NORMAL },
  // Jumat: istirahat lebih awal (09.30 - 09.50, setelah JP 3) dan hanya 5 JP
  JUMAT:  { kegiatanAwal: "Imtaq",             jumlahJp: 5, istirahat: [{ setelahJp: 3, menit: 20 }] },
  SABTU:  { kegiatanAwal: "Olahraga",          jumlahJp: 9, istirahat: ISTIRAHAT_NORMAL },
};
// =======================================================

export type JamPelajaran = { ke: number; mulai: string; selesai: string };

function keMenit(jam: string): number {
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + m;
}

function keJam(menit: number): string {
  const h = Math.floor(menit / 60);
  const m = menit % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buatTabel(pola: PolaHari): JamPelajaran[] {
  const hasil: JamPelajaran[] = [];
  let t = keMenit(JAM_PERTAMA);
  for (let ke = 1; ke <= pola.jumlahJp; ke++) {
    hasil.push({ ke, mulai: keJam(t), selesai: keJam(t + DURASI_JP_MENIT) });
    t += DURASI_JP_MENIT;
    const rehat = pola.istirahat.find((i) => i.setelahJp === ke);
    if (rehat) t += rehat.menit;
  }
  return hasil;
}

const TABEL = Object.fromEntries(
  (Object.keys(POLA_HARI) as NamaHari[]).map((h) => [h, buatTabel(POLA_HARI[h])])
) as Record<NamaHari, JamPelajaran[]>;

function hariDikenal(hari: string): hari is NamaHari {
  return Object.prototype.hasOwnProperty.call(POLA_HARI, hari);
}

/** Daftar jam pelajaran pada suatu hari (kosong jika hari belum dipilih / tidak dikenal). */
export function jamPelajaranHari(hari: string): JamPelajaran[] {
  return hariDikenal(hari) ? TABEL[hari] : [];
}

/** Waktu istirahat pada suatu hari (celah antara dua jam pelajaran). */
export function istirahatHari(hari: string): { mulai: string; selesai: string }[] {
  const tabel = jamPelajaranHari(hari);
  const hasil: { mulai: string; selesai: string }[] = [];
  for (let i = 1; i < tabel.length; i++) {
    if (tabel[i - 1].selesai !== tabel[i].mulai) {
      hasil.push({ mulai: tabel[i - 1].selesai, selesai: tabel[i].mulai });
    }
  }
  return hasil;
}

export function cariJpMulai(hari: string, jam: string): JamPelajaran | undefined {
  return jamPelajaranHari(hari).find((j) => j.mulai === jam);
}

export function cariJpSelesai(hari: string, jam: string): JamPelajaran | undefined {
  return jamPelajaranHari(hari).find((j) => j.selesai === jam);
}

function bersambung(tabel: JamPelajaran[], ke: number): boolean {
  const a = tabel[ke - 1];
  const b = tabel[ke];
  return !!a && !!b && a.selesai === b.mulai;
}

/** Jumlah JP terbanyak jika mulai dari JP ke-`keMulai` (berhenti sebelum istirahat / akhir hari). */
export function maksJumlahJp(hari: string, keMulai: number): number {
  const tabel = jamPelajaranHari(hari);
  let jumlah = 1;
  let ke = keMulai;
  while (bersambung(tabel, ke)) {
    jumlah += 1;
    ke += 1;
  }
  return jumlah;
}

/** Jam selesai jika mulai dari JP ke-`keMulai` selama `jumlahJp` jam pelajaran. */
export function jamSelesaiDari(hari: string, keMulai: number, jumlahJp: number): string | null {
  const akhir = jamPelajaranHari(hari)[keMulai - 1 + jumlahJp - 1];
  return akhir ? akhir.selesai : null;
}

/** Berapa JP dari jamMulai sampai jamSelesai; null jika tidak sesuai tabel jam hari itu. */
export function hitungJumlahJp(hari: string, jamMulai: string, jamSelesai: string): number | null {
  const a = cariJpMulai(hari, jamMulai);
  const b = cariJpSelesai(hari, jamSelesai);
  if (!a || !b || b.ke < a.ke) return null;
  return b.ke - a.ke + 1;
}

/** Validasi rentang jam menurut hari. Mengembalikan null jika valid, atau pesan kesalahan. */
export function validasiRentangJam(
  hari: string,
  jamMulai: string,
  jamSelesai: string
): { field: "jamMulai" | "jamSelesai"; message: string } | null {
  if (!hariDikenal(hari)) {
    return { field: "jamMulai", message: "Pilih hari terlebih dahulu" };
  }
  const tabel = TABEL[hari];
  const a = tabel.find((j) => j.mulai === jamMulai);
  if (!a) {
    return { field: "jamMulai", message: "Jam mulai harus dipilih dari daftar jam pelajaran hari ini" };
  }
  const b = tabel.find((j) => j.selesai === jamSelesai);
  if (!b) {
    return { field: "jamSelesai", message: "Jam selesai harus dipilih dari daftar jam pelajaran hari ini" };
  }
  if (b.ke < a.ke) {
    return { field: "jamSelesai", message: "Jam selesai tidak boleh lebih awal dari jam mulai" };
  }
  for (let ke = a.ke; ke < b.ke; ke++) {
    if (!bersambung(tabel, ke)) {
      return {
        field: "jamSelesai",
        message: "Rentang jam pelajaran tidak boleh melewati waktu istirahat",
      };
    }
  }
  return null;
}

/** Ringkasan pola jam pada suatu hari, untuk keterangan di form. */
export function ringkasanHari(hari: string): string {
  const tabel = jamPelajaranHari(hari);
  if (tabel.length === 0 || !hariDikenal(hari)) return "";
  const rehat = istirahatHari(hari)
    .map((r) => `${r.mulai} - ${r.selesai}`)
    .join(", ");
  return (
    `JP 1-${tabel.length} (${tabel[0].mulai} - ${tabel[tabel.length - 1].selesai}). ` +
    `Istirahat ${rehat}. ` +
    `Sebelum JP 1: ${POLA_HARI[hari].kegiatanAwal} (${KEGIATAN_AWAL.mulai} - ${KEGIATAN_AWAL.selesai}).`
  );
}

export function labelJp(jp: JamPelajaran): string {
  return `JP ke-${jp.ke} (${jp.mulai} - ${jp.selesai})`;
}

export function labelDurasi(jumlahJp: number): string {
  return `${jumlahJp} JP (${jumlahJp * DURASI_JP_MENIT} menit)`;
}