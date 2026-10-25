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

export interface ProgresHafalanResult {
  /** Jumlah ayat unik yang evaluasi terbarunya bernilai L (tanpa dobel hitung rentang tumpang tindih). */
  totalAyatBerhasil: number;
  totalAyatQuran: number;
  /** 0-100, dibulatkan 1 desimal. */
  persentase: number;
  /** Jumlah rentang setoran (bukan ayat) yang seluruh ayatnya sudah dinyatakan berhasil. */
  jumlahRentangBerhasil: number;
  /** Rentang yang sudah diinput tapi masih ada ayat yang evaluasi terbarunya L-. */
  jumlahRentangBelumTuntas: number;
}

/**
 * Hitung persentase ayat Al-Qur'an yang berhasil dihafal siswa.
 *
 * Aturan:
 * - Setiap setoran memberi nilai pada ayat-ayat dalam rentangnya.
 * - Status sebuah ayat ditentukan oleh evaluasi TERBARU yang mencakup ayat itu
 *   (urut menurut tanggal, lalu id untuk tanggal yang sama).
 *   Jadi ayat yang sempat L- lalu diulang dan mendapat L ikut dihitung,
 *   sedangkan ayat yang evaluasi terbarunya L- tidak dihitung sampai diulang dan lulus.
 * - Ayat dari rentang yang overlap dihitung sekali saja (kunci ayat unik lintas surat).
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
  const statusAyat = new Map<number, "L" | "L_MIN">();
  for (const r of urut) {
    // Batasi ke jumlah ayat surat tsb, supaya data tak wajar tidak menggeser ke surat lain.
    const akhir = Math.min(r.ayatSelesai!, JUMLAH_AYAT[r.nomorSurat!] ?? 0);
    for (let a = r.ayatMulai!; a <= akhir; a++) {
      statusAyat.set(ayatGlobal(r.nomorSurat!, a), r.nilai);
    }
  }

  let totalAyatBerhasil = 0;
  for (const status of statusAyat.values()) {
    if (status === "L") totalAyatBerhasil += 1;
  }

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
      if (statusAyat.get(ayatGlobal(r.nomorSurat!, a)) !== "L") {
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
  };
}