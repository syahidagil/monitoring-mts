import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveAnak: vi.fn(),
  nilaiFindMany: vi.fn(),
}));

vi.mock("./dashboard.action", () => ({ resolveAnak: mocks.resolveAnak }));
vi.mock("@/lib/prisma", () => ({ prisma: { nilai: { findMany: mocks.nilaiFindMany } } }));

import { getNilaiAnak } from "./nilai.action";

const anakFixture = {
  id: 10,
  nis: "S-10",
  nama: "Alya",
  statusTahfidz: false,
  kelas: { id: 2, nama: "VIII A", tahunAjaran: { id: 3, nama: "2026/2027", semester: "GANJIL" } },
};

describe("monitoring nilai anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue(anakFixture);
  });

  it("tidak mengambil nilai jika anak tidak lolos pemeriksaan kepemilikan", async () => {
    mocks.resolveAnak.mockResolvedValue(null);

    const result = await getNilaiAnak({ siswaId: 99 });

    expect(result).toBeNull();
    expect(mocks.nilaiFindMany).not.toHaveBeenCalled();
  });

  it("mengelompokkan nilai per mapel dan merata-ratakan input berulang", async () => {
    mocks.nilaiFindMany
      .mockResolvedValueOnce([{ tahunAjar: "2026/2027", semester: "GANJIL" }])
      .mockResolvedValueOnce([
        { jenis: "TUGAS", nilai: "80", guruMapel: { mataPelajaran: { kodeMapel: "IPA", namaMapel: "IPA" } } },
        { jenis: "HARIAN", nilai: "80", guruMapel: { mataPelajaran: { kodeMapel: "IPA", namaMapel: "IPA" } } },
        { jenis: "HARIAN", nilai: "100", guruMapel: { mataPelajaran: { kodeMapel: "IPA", namaMapel: "IPA" } } },
        { jenis: "UAS", nilai: "90", guruMapel: { mataPelajaran: { kodeMapel: "IPA", namaMapel: "IPA" } } },
      ]);

    const result = await getNilaiAnak({ siswaId: 10 });

    expect(mocks.nilaiFindMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { siswaId: 10 },
      distinct: ["tahunAjar", "semester"],
    }));
    expect(result?.tahunAjar).toBe("2026/2027");
    expect(result?.perMapel).toEqual([expect.objectContaining({
      kodeMapel: "IPA",
      perJenis: { TUGAS: 80, PR: null, HARIAN: 90, UTS: null, UAS: 90 },
      rataRata: 87.8,
      lengkap: true,
    })]);
    expect(result?.ringkasan).toEqual({ rataKeseluruhan: 87.8, jumlahMapel: 1 });
  });
});