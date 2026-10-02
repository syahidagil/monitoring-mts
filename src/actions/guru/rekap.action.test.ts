import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  jadwalFindMany: vi.fn(),
  absensiFindMany: vi.fn(),
  nilaiFindMany: vi.fn(),
  sikapFindMany: vi.fn(),
  hafalanFindMany: vi.fn(),
  tahsinFindMany: vi.fn(),
  siswaFindMany: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    jadwal: { findMany: mocks.jadwalFindMany },
    absensi: { findMany: mocks.absensiFindMany },
    nilai: { findMany: mocks.nilaiFindMany },
    sikap: { findMany: mocks.sikapFindMany },
    hafalan: { findMany: mocks.hafalanFindMany },
    tahsin: { findMany: mocks.tahsinFindMany },
    siswa: { findMany: mocks.siswaFindMany },
  },
}));

import {
  getRekapAbsensiGuru,
  getRekapHafalanGuru,
  getRekapNilaiGuru,
  getRekapSikapGuru,
  getRekapTahsinGuru,
} from "./rekap.action";

describe("rekap monitoring guru (US-15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.jadwalFindMany.mockResolvedValue([{ id: 5, kelasId: 2, kelas: { nama: "VIII A" } }]);
  });

  it("tidak mengembalikan rekap kepada pengguna yang bukan guru", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "ortu-1", role: "ORANGTUA" } });

    const result = await getRekapAbsensiGuru();

    expect(result).toEqual([]);
    expect(mocks.jadwalFindMany).not.toHaveBeenCalled();
    expect(mocks.absensiFindMany).not.toHaveBeenCalled();
  });

  it("mengelompokkan absensi per siswa dan menghitung tiap status", async () => {
    mocks.absensiFindMany.mockResolvedValue([
      { siswaId: 10, siswa: { id: 10, nis: "S-10", nama: "Alya" }, jadwal: { kelas: { nama: "VIII A" } }, status: "HADIR" },
      { siswaId: 10, siswa: { id: 10, nis: "S-10", nama: "Alya" }, jadwal: { kelas: { nama: "VIII A" } }, status: "SAKIT" },
      { siswaId: 11, siswa: { id: 11, nis: "S-11", nama: "Bima" }, jadwal: { kelas: { nama: "VIII A" } }, status: "ALPA" },
    ]);

    const result = await getRekapAbsensiGuru({ kelasId: 2, tanggalMulai: "2026-10-01", tanggalAkhir: "2026-10-31" });

    expect(mocks.jadwalFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { guruId: "guru-1", kelasId: 2 },
    }));
    expect(mocks.absensiFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        jadwalId: { in: [5] },
        tanggal: { gte: new Date("2026-10-01"), lte: new Date("2026-10-31") },
      },
    }));
    expect(result).toEqual([
      { siswa: { id: 10, nis: "S-10", nama: "Alya" }, kelas: "VIII A", HADIR: 1, SAKIT: 1, IZIN: 0, ALPA: 0, total: 2 },
      { siswa: { id: 11, nis: "S-11", nama: "Bima" }, kelas: "VIII A", HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 1, total: 1 },
    ]);
  });

  it("menghitung ringkasan nilai tiap siswa melalui rumus rapor", async () => {
    mocks.nilaiFindMany.mockResolvedValue([
      { siswaId: 10, siswa: { id: 10, nis: "S-10", nama: "Alya", kelas: { nama: "VIII A" } }, jenis: "TUGAS", nilai: "80" },
      { siswaId: 10, siswa: { id: 10, nis: "S-10", nama: "Alya", kelas: { nama: "VIII A" } }, jenis: "UAS", nilai: "90" },
    ]);

    const result = await getRekapNilaiGuru({ kelasId: 2, semester: "GANJIL", tahunAjar: "2026/2027" });

    expect(mocks.nilaiFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        guruId: "guru-1",
        semester: "GANJIL",
        tahunAjar: "2026/2027",
        siswa: { kelasId: 2 },
      },
    }));
    expect(result).toEqual([expect.objectContaining({
      siswa: { id: 10, nis: "S-10", nama: "Alya", kelas: { nama: "VIII A" } },
      kelas: "VIII A",
      rataPH: 80,
      nilaiPAT: 90,
      lengkap: true,
      rata: "83.3",
    })]);
  });

  it("membatasi rekap hafalan ke santri tahfidz di kelas yang diajar", async () => {
    mocks.hafalanFindMany.mockResolvedValue([]);

    await getRekapHafalanGuru({ kelasId: 2, siswaId: 10 });

    expect(mocks.hafalanFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswa: { kelasId: { in: [2] }, statusTahfidz: true, id: 10 } },
    }));
  });

  it("membatasi rekap sikap ke kelas yang diajar dan filter semester", async () => {
    mocks.sikapFindMany.mockResolvedValue([{ id: 3, jenisSikap: "POSITIF" }]);

    const result = await getRekapSikapGuru({ kelasId: 2, semester: "GANJIL", tahunAjar: "2026/2027" });

    expect(mocks.sikapFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        siswa: { kelasId: { in: [2] } },
        semester: "GANJIL",
        tahunAjar: "2026/2027",
      },
    }));
    expect(result).toEqual([{ id: 3, jenisSikap: "POSITIF" }]);
  });

  it("membatasi rekap tahsin ke siswa non-tahfidz di kelas yang diajar", async () => {
    mocks.tahsinFindMany.mockResolvedValue([{ id: 4, surat: "Al-Fatihah" }]);

    const result = await getRekapTahsinGuru({ kelasId: 2, siswaId: 10 });

    expect(mocks.tahsinFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswa: { kelasId: { in: [2] }, statusTahfidz: false, id: 10 } },
    }));
    expect(result).toEqual([{ id: 4, surat: "Al-Fatihah" }]);
  });
});