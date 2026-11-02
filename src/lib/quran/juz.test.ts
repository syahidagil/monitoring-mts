import { describe, expect, it } from "vitest";
import { hitungJuz } from "./surat";
import { daftarSuratDiJuz, rentangAyatDiJuz } from "./juz";

function juzYangMemuat(nomorSurat: number): number[] {
  return Array.from({ length: 30 }, (_, i) => i + 1).filter((juz) =>
    daftarSuratDiJuz(juz).some((s) => s.nomor === nomorSurat)
  );
}

describe("surat per juz", () => {
  it("setiap ayat berada di tepat satu juz dan cocok dengan hitungJuz", () => {
    let total = 0;
    let salah = 0;
    for (let juz = 1; juz <= 30; juz++) {
      for (const s of daftarSuratDiJuz(juz)) {
        for (let a = s.ayatMulai; a <= s.ayatSelesai; a++) {
          total += 1;
          if (hitungJuz(s.nomor, a) !== juz) salah += 1;
        }
      }
    }
    expect(salah).toBe(0);
    expect(total).toBe(6236);
  });

  it("Juz 30 memuat An-Naba' sampai An-Nas (37 surat)", () => {
    const daftar = daftarSuratDiJuz(30);
    expect(daftar).toHaveLength(37);
    expect(daftar[0].nomor).toBe(78);
    expect(daftar[daftar.length - 1].nomor).toBe(114);
    expect(daftar.every((s) => !s.sebagian)).toBe(true);
  });

  it("surat lintas juz tampil di semua juz yang memuatnya", () => {
    expect(juzYangMemuat(2)).toEqual([1, 2, 3]); // Al-Baqarah
    expect(juzYangMemuat(4)).toEqual([4, 5, 6]); // An-Nisa'
    expect(juzYangMemuat(3)).toEqual([3, 4]);    // Ali 'Imran
  });

  it("rentang ayat Al-Baqarah pada tiap juz", () => {
    expect(rentangAyatDiJuz(1, 2)).toEqual({ mulai: 1, selesai: 141 });
    expect(rentangAyatDiJuz(2, 2)).toEqual({ mulai: 142, selesai: 252 });
    expect(rentangAyatDiJuz(3, 2)).toEqual({ mulai: 253, selesai: 286 });
  });

  it("surat yang tidak ada di juz tersebut menghasilkan null", () => {
    expect(rentangAyatDiJuz(30, 1)).toBeNull();
    expect(rentangAyatDiJuz(1, 114)).toBeNull();
  });

  it("juz yang berakhir tepat sebelum ayat 1 sebuah surat tidak memuat surat itu", () => {
    // Juz 14 dimulai di Al-Hijr ayat 1, jadi Al-Hijr bukan bagian Juz 13
    expect(daftarSuratDiJuz(13).map((s) => s.nomor)).toEqual([12, 13, 14]);
  });

  it("nomor juz di luar 1-30 menghasilkan daftar kosong", () => {
    expect(daftarSuratDiJuz(0)).toEqual([]);
    expect(daftarSuratDiJuz(31)).toEqual([]);
  });
});