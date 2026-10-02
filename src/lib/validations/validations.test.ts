import { describe, expect, it } from "vitest";
import { GuruSchema } from "./guru.validation";
import { jadwalSchema } from "./jadwal.validation";
import { KelasSchema } from "./kelas.validation";
import { MapelSchema } from "./mapel.validation";
import { OrangtuaSchema } from "./orangtua.validation";
import { SiswaSchema } from "./siswa.validation";
import { tahunAjaranSchema } from "./tahunAjaran.validation";

describe("validasi form data", () => {
  it("menerima data siswa valid dan memberi nilai default", () => {
    const result = SiswaSchema.safeParse({
      nis: "2025001",
      nama: "Alya Putri",
      jenisKelamin: "P",
      tanggalLahir: "2012-05-20",
      kelasId: "1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kelasId).toBe(1);
      expect(result.data.status).toBe(true);
      expect(result.data.statusTahfidz).toBe(false);
    }
  });

  it("menolak nama siswa yang terlalu pendek dan kelas yang tidak valid", () => {
    const result = SiswaSchema.safeParse({
      nis: "2025001",
      nama: "A",
      jenisKelamin: "P",
      tanggalLahir: "2012-05-20",
      kelasId: "0",
    });

    expect(result.success).toBe(false);
  });

  it("menerima data guru valid dan menolak username terlalu pendek", () => {
    const valid = GuruSchema.safeParse({ username: "guru01", name: "Budi", mapel: "IPA" });
    const invalid = GuruSchema.safeParse({ username: "ab", name: "Budi", mapel: "IPA" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("menerima data wali murid valid dan menolak password yang terlalu pendek", () => {
    const valid = OrangtuaSchema.safeParse({ username: "ortu01", name: "Siti" });
    const invalid = OrangtuaSchema.safeParse({ username: "ortu01", name: "Siti", password: "123" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("menerima kelas tingkat 7 sampai 9 dan menolak tingkat di luar rentang", () => {
    const valid = KelasSchema.safeParse({ nama: "VII A", tingkat: "7", tahunAjaranId: "1" });
    const invalid = KelasSchema.safeParse({ nama: "VI A", tingkat: "6", tahunAjaranId: "1" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("mengubah kode mata pelajaran menjadi huruf kapital", () => {
    const result = MapelSchema.safeParse({ kodeMapel: "ipa", namaMapel: "IPA" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.kodeMapel).toBe("IPA");
  });

  it("menerima tahun ajaran berurutan dan menolak rentang tahun yang salah", () => {
    const valid = tahunAjaranSchema.safeParse({ nama: "2025/2026", semester: "GANJIL" });
    const invalid = tahunAjaranSchema.safeParse({ nama: "2025/2027", semester: "GANJIL" });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("menerima jadwal dengan rentang jam valid dan menolak jam mulai setelah jam selesai", () => {
    const data = {
      hari: "SENIN",
      kodeMapel: "IPA",
      jamMulai: "08:00",
      jamSelesai: "09:00",
      guruId: "guru-1",
      kelasId: "1",
      tahunAjaranId: "1",
    };

    expect(jadwalSchema.safeParse(data).success).toBe(true);
    expect(jadwalSchema.safeParse({ ...data, jamMulai: "09:00", jamSelesai: "08:00" }).success).toBe(false);
  });
});