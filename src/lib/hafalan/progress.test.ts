import { describe, expect, it } from "vitest";
import { hitungProgresHafalan, TOTAL_AYAT_QURAN } from "./progress";

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