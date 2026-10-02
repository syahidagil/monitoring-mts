import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveAnak: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("./dashboard.action", () => ({ resolveAnak: mocks.resolveAnak }));
vi.mock("@/lib/prisma", () => ({ prisma: { tahsin: { findMany: mocks.findMany } } }));

import { getTahsinAnak } from "./tahsin.action";

describe("monitoring tahsin anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue({ id: 10, nama: "Alya" });
    mocks.findMany.mockResolvedValue([
      { id: 1, tanggal: new Date(2025, 7, 10), hari: "MINGGU", juz: 1, surat: "Al-Fatihah", halaman: 1, tajwid: "L", makhraj: "L", sifatul: "L_MIN", keterangan: null, guru: { user: { name: "Pak Guru" } } },
      { id: 2, tanggal: new Date(2025, 7, 8), hari: "JUMAT", juz: 1, surat: "Al-Baqarah", halaman: 2, tajwid: "L_MIN", makhraj: "L", sifatul: "L", keterangan: "Perhatikan tajwid", guru: { user: { name: "Pak Guru" } } },
    ]);
  });

  it("menghitung persentase kelulusan untuk tiga aspek tahsin", async () => {
    const result = await getTahsinAnak({ siswaId: 10, tahunAjar: "2025/2026" });

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswaId: 10 },
      orderBy: { tanggal: "desc" },
    }));
    expect(result?.aspek).toEqual([
      { nama: "Tajwid", persen: 50 },
      { nama: "Makhraj", persen: 100 },
      { nama: "Sifatul Huruf", persen: 50 },
    ]);
    expect(result?.ringkasan).toEqual({ totalSetoran: 2, juzTersentuh: 1 });
    expect(result?.rows[0].guruNama).toBe("Pak Guru");
  });
});