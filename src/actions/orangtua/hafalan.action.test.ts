import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveAnak: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("./dashboard.action", () => ({ resolveAnak: mocks.resolveAnak }));
vi.mock("@/lib/prisma", () => ({ prisma: { hafalan: { findMany: mocks.findMany } } }));

import { getHafalanAnak } from "./hafalan.action";

describe("monitoring hafalan anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue({ id: 10, nama: "Alya" });
    mocks.findMany.mockResolvedValue([
      { id: 1, tanggal: new Date(2025, 7, 10), hari: "MINGGU", juz: 1, surat: "Al-Fatihah", halaman: 1, nilai: "L", keterangan: null, guru: { user: { name: "Pak Guru" } } },
      { id: 2, tanggal: new Date(2025, 7, 8), hari: "JUMAT", juz: 1, surat: "Al-Baqarah", halaman: 2, nilai: "L_MIN", keterangan: "Ulangi", guru: { user: { name: "Pak Guru" } } },
      { id: 3, tanggal: new Date(2025, 5, 10), hari: "SELASA", juz: 2, surat: "An-Nas", halaman: 3, nilai: "L", keterangan: null, guru: { user: { name: "Bu Guru" } } },
    ]);
  });

  it("menghitung ringkasan setoran untuk tahun ajaran yang dipilih", async () => {
    const result = await getHafalanAnak({ siswaId: 10, tahunAjar: "2025/2026" });

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswaId: 10 },
      orderBy: { tanggal: "desc" },
    }));
    expect(result?.ringkasan).toEqual({
      juzTertinggi: 1,
      jumlahJuz: 1,
      totalHalaman: 2,
      totalSetoran: 2,
      lancar: 1,
      persentaseProgres: 50,
      targetJuz: 30,
    });
    expect(result?.rows).toHaveLength(2);
    expect(result?.rows[1].keterangan).toBe("Ulangi");
  });
});