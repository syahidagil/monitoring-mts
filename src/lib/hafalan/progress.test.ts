import { describe, expect, it } from "vitest";
import { DAFTAR_SURAT } from "@/lib/quran/surat";
import { hitungProgresHafalan, totalAyatJuz, TOTAL_AYAT_QURAN } from "./progress";

type Nilai = "L" | "L_MIN";

function rec(
  id: number,
  tanggal: string,
  nomorSurat: number | null,
  ayatMulai: number | null,
  ayatSelesai: number | null,
  nilai: Nilai
) {
  return { id, tanggal, nomorSurat, ayatMulai, ayatSelesai, nilai };
}

describe("hitungProgresHafalan", () => {
  it("menghitung ayat yang lulus dan menghindari hitung ganda pada rentang overlap", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", 1, 1, 5, "L"),
      rec(2, "2026-10-25", 1, 4, 7, "L"),
    ]);

    expect(result.totalAyatBerhasil).toBe(7);
    expect(result.totalAyatQuran).toBe(TOTAL_AYAT_QURAN);
    expect(result.jumlahRentangBerhasil).toBe(2);
    expect(result.persentase).toBe(0.1);
  });

  it("tidak menghitung rentang jika evaluasi terbarunya L_MIN", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", 1, 1, 3, "L"),
      rec(2, "2026-10-25", 1, 1, 3, "L_MIN"),
    ]);

    expect(result.totalAyatBerhasil).toBe(0);
    expect(result.jumlahRentangBerhasil).toBe(0);
    expect(result.jumlahRentangBelumTuntas).toBe(1);
  });

  it("menghitung rentang yang awalnya L_MIN lalu diulang dan mendapat L", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", 1, 1, 3, "L_MIN"),
      rec(2, "2026-10-25", 1, 1, 3, "L"),
    ]);

    expect(result.totalAyatBerhasil).toBe(3);
    expect(result.jumlahRentangBerhasil).toBe(1);
    expect(result.jumlahRentangBelumTuntas).toBe(0);
  });

  it("kasus An-Naba': ayat 21-25 L- lalu diulang L, total 25 ayat", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", 78, 1, 10, "L"),
      rec(2, "2026-10-25", 78, 11, 20, "L"),
      rec(3, "2026-10-25", 78, 21, 25, "L_MIN"),
      rec(4, "2026-10-25", 78, 21, 25, "L"),
    ]);

    expect(result.totalAyatBerhasil).toBe(25);
    expect(result.jumlahRentangBerhasil).toBe(3);
    expect(result.jumlahRentangBelumTuntas).toBe(0);
    expect(result.persentase).toBe(0.4);
  });

  it("urutan input tidak berpengaruh: tanggal sama diurutkan dengan id", () => {
    const result = hitungProgresHafalan([
      rec(2, "2026-10-25", 1, 1, 3, "L"),
      rec(1, "2026-10-25", 1, 1, 3, "L_MIN"),
    ]);

    expect(result.totalAyatBerhasil).toBe(3);
  });

  it("tanggal lebih baru menang atas id yang lebih besar", () => {
    const result = hitungProgresHafalan([
      rec(2, "2026-10-01", 1, 1, 3, "L"),
      rec(1, "2026-10-02", 1, 1, 3, "L_MIN"),
    ]);

    expect(result.totalAyatBerhasil).toBe(0);
    expect(result.jumlahRentangBelumTuntas).toBe(1);
  });

  it("menghitung ayat yang diulang dengan batas rentang berbeda", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", 78, 21, 25, "L_MIN"),
      rec(2, "2026-10-26", 78, 21, 23, "L"),
      rec(3, "2026-10-26", 78, 24, 25, "L"),
    ]);

    expect(result.totalAyatBerhasil).toBe(5);
    expect(result.jumlahRentangBelumTuntas).toBe(0);
  });

  it("mengabaikan record lama tanpa data rentang ayat", () => {
    const result = hitungProgresHafalan([
      rec(1, "2026-10-25", null, null, null, "L"),
    ]);

    expect(result.totalAyatBerhasil).toBe(0);
    expect(result.jumlahRentangBerhasil).toBe(0);
    expect(result.jumlahRentangBelumTuntas).toBe(0);
  });
});

describe("progres hafalan per juz", () => {
  it("jumlah ayat seluruh juz sama dengan total ayat Al-Qur'an", () => {
    const hasil = hitungProgresHafalan([]);
    expect(hasil.perJuz).toHaveLength(30);
    const jumlah = hasil.perJuz.reduce((sum, j) => sum + j.totalAyat, 0);
    expect(jumlah).toBe(TOTAL_AYAT_QURAN);
    expect(totalAyatJuz(1)).toBe(148);
    expect(totalAyatJuz(30)).toBe(564);
  });

  it("tanpa setoran: semua juz kosong dan tidak ada juz aktif", () => {
    const hasil = hitungProgresHafalan([]);
    expect(hasil.juzAktif).toBeNull();
    expect(hasil.jumlahJuzTuntas).toBe(0);
    expect(hasil.perJuz.every((j) => !j.adaSetoran && j.ayatBerhasil === 0)).toBe(true);
  });

  it("kasus An-Naba': 25 ayat = 4,4% dari Juz 30 (564 ayat)", () => {
    const hasil = hitungProgresHafalan([
      rec(1, "2026-10-25", 78, 1, 10, "L"),
      rec(2, "2026-10-25", 78, 11, 20, "L"),
      rec(3, "2026-10-25", 78, 21, 25, "L_MIN"),
      rec(4, "2026-10-25", 78, 21, 25, "L"),
    ]);

    const juz30 = hasil.perJuz[29];
    expect(juz30.ayatBerhasil).toBe(25);
    expect(juz30.totalAyat).toBe(564);
    expect(juz30.persentase).toBe(4.4);
    expect(juz30.adaSetoran).toBe(true);
    expect(hasil.juzAktif).toBe(30);
    // juz lain tidak tersentuh
    expect(hasil.perJuz[0].adaSetoran).toBe(false);
  });

  it("rentang yang melewati batas juz dibagi ke juz masing-masing", () => {
    // Al-Baqarah ayat 142 adalah awal Juz 2, jadi ayat 140-141 masuk Juz 1
    const hasil = hitungProgresHafalan([rec(1, "2026-10-25", 2, 140, 144, "L")]);

    expect(hasil.perJuz[0].ayatBerhasil).toBe(2);
    expect(hasil.perJuz[1].ayatBerhasil).toBe(3);
    expect(hasil.totalAyatBerhasil).toBe(5);
  });

  it("ayat L_MIN menandai juz tersentuh tetapi tidak menambah ayat berhasil", () => {
    const hasil = hitungProgresHafalan([rec(1, "2026-10-25", 1, 1, 7, "L_MIN")]);

    expect(hasil.perJuz[0].adaSetoran).toBe(true);
    expect(hasil.perJuz[0].ayatBerhasil).toBe(0);
    expect(hasil.perJuz[0].persentase).toBe(0);
  });

  it("juz aktif mengikuti setoran terbaru", () => {
    const hasil = hitungProgresHafalan([
      rec(1, "2026-10-20", 78, 1, 5, "L"),
      rec(2, "2026-10-25", 67, 1, 5, "L"),
    ]);

    expect(hasil.juzAktif).toBe(29);
  });

  it("seluruh ayat Juz 30 berhasil = 100% dan dihitung sebagai juz tuntas", () => {
    const records = DAFTAR_SURAT.filter((s) => s.nomor >= 78).map((s, i) =>
      rec(i + 1, "2026-10-25", s.nomor, 1, s.jumlahAyat, "L")
    );
    const hasil = hitungProgresHafalan(records);

    expect(hasil.perJuz[29].ayatBerhasil).toBe(564);
    expect(hasil.perJuz[29].persentase).toBe(100);
    expect(hasil.jumlahJuzTuntas).toBe(1);
  });
});