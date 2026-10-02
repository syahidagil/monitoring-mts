import { describe, expect, it } from "vitest";
import { hitungProgresHafalan, TOTAL_AYAT_QURAN } from "./progress";

describe("hitungProgresHafalan", () => {
  it("menghitung ayat yang lulus dan menghindari hitung ganda pada rentang overlap", () => {
    const result = hitungProgresHafalan([
      { nomorSurat: 1, ayatMulai: 1, ayatSelesai: 5, nilai: "L" },
      { nomorSurat: 1, ayatMulai: 4, ayatSelesai: 7, nilai: "L" },
    ]);

    expect(result.totalAyatBerhasil).toBe(7);
    expect(result.totalAyatQuran).toBe(TOTAL_AYAT_QURAN);
    expect(result.jumlahRentangBerhasil).toBe(2);
    expect(result.persentase).toBe(0.1);
  });

  it("menganggap rentang belum tuntas jika salah satu evaluasi bernilai L_MIN", () => {
    const result = hitungProgresHafalan([
      { nomorSurat: 1, ayatMulai: 1, ayatSelesai: 3, nilai: "L" },
      { nomorSurat: 1, ayatMulai: 1, ayatSelesai: 3, nilai: "L_MIN" },
    ]);

    expect(result.totalAyatBerhasil).toBe(0);
    expect(result.jumlahRentangBerhasil).toBe(0);
    expect(result.jumlahRentangBelumTuntas).toBe(1);
  });

  it("mengabaikan record lama tanpa data rentang ayat", () => {
    const result = hitungProgresHafalan([
      { nomorSurat: null, ayatMulai: null, ayatSelesai: null, nilai: "L" },
    ]);

    expect(result.totalAyatBerhasil).toBe(0);
    expect(result.jumlahRentangBerhasil).toBe(0);
    expect(result.jumlahRentangBelumTuntas).toBe(0);
  });
});