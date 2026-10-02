import { describe, expect, it } from "vitest";
import { hitungNilaiRapor } from "./rapor";

describe("hitungNilaiRapor", () => {
  it("menghitung nilai akhir dengan bobot PH 67% dan PAT 33%", () => {
    const result = hitungNilaiRapor([
      { jenis: "TUGAS", nilai: 80 },
      { jenis: "HARIAN", nilai: 90 },
      { jenis: "PR", nilai: 70 },
      { jenis: "UTS", nilai: 80 },
      { jenis: "UAS", nilai: 90 },
    ]);

    expect(result).toEqual({ rataPH: 80, nilaiPAT: 90, nilaiAkhir: 83.3, lengkap: true });
  });

  it("menampilkan rata-rata PH sementara ketika UAS belum tersedia", () => {
    const result = hitungNilaiRapor([
      { jenis: "TUGAS", nilai: 80 },
      { jenis: "HARIAN", nilai: 90 },
    ]);

    expect(result).toEqual({ rataPH: 85, nilaiPAT: null, nilaiAkhir: 85, lengkap: false });
  });

  it("mengabaikan jenis nilai yang tidak termasuk perhitungan rapor", () => {
    const result = hitungNilaiRapor([{ jenis: "SIKAP", nilai: 100 }]);

    expect(result).toEqual({ rataPH: null, nilaiPAT: null, nilaiAkhir: null, lengkap: false });
  });
});