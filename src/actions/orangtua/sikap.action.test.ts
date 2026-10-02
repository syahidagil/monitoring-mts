import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveAnak: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("./dashboard.action", () => ({ resolveAnak: mocks.resolveAnak }));
vi.mock("@/lib/prisma", () => ({ prisma: { sikap: { findMany: mocks.findMany } } }));

import { getSikapAnak } from "./sikap.action";

const anakFixture = {
  id: 10,
  nama: "Alya",
  kelas: { tahunAjaran: { nama: "2026/2027", semester: "GANJIL" } },
};

describe("monitoring sikap anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue(anakFixture);
    mocks.findMany
      .mockResolvedValueOnce([{ tahunAjar: "2026/2027", semester: "GANJIL" }])
      .mockResolvedValueOnce([
        { id: 1, tanggal: new Date(2026, 9, 1), jenisSikap: "POSITIF", kategori: "Disiplin", keterangan: "Rajin", guru: { user: { name: "Pak Guru" } } },
        { id: 2, tanggal: new Date(2026, 9, 2), jenisSikap: "PELANGGARAN", kategori: "Terlambat", keterangan: "Datang terlambat", guru: { user: { name: "Pak Guru" } } },
        { id: 3, tanggal: new Date(2026, 8, 30), jenisSikap: "POSITIF", kategori: "Sosial", keterangan: "Membantu teman", guru: { user: { name: "Bu Guru" } } },
      ]);
  });

  it("meringkas sikap positif dan pelanggaran pada bulan yang dipilih", async () => {
    const result = await getSikapAnak({ siswaId: 10, bulan: 10 });

    expect(mocks.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { siswaId: 10, semester: "GANJIL", tahunAjar: "2026/2027" },
    }));
    expect(result?.statistik).toEqual({ total: 2, positif: 1, pelanggaran: 1 });
    expect(result?.rows).toHaveLength(2);
    expect(result?.rows[0].guruNama).toBe("Pak Guru");
  });
});