import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  siswaFindMany: vi.fn(),
  siswaFindFirst: vi.fn(),
  orangTuaFindUnique: vi.fn(),
  absensiFindMany: vi.fn(),
  nilaiFindMany: vi.fn(),
  sikapFindMany: vi.fn(),
  tahsinFindMany: vi.fn(),
  hafalanFindMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    siswa: { findMany: mocks.siswaFindMany, findFirst: mocks.siswaFindFirst },
    orangTua: { findUnique: mocks.orangTuaFindUnique },
    absensi: { findMany: mocks.absensiFindMany },
    nilai: { findMany: mocks.nilaiFindMany },
    sikap: { findMany: mocks.sikapFindMany },
    tahsin: { findMany: mocks.tahsinFindMany },
    hafalan: { findMany: mocks.hafalanFindMany },
    $transaction: mocks.transaction,
  },
}));

import { getDashboardOrangTua, resolveAnak } from "./dashboard.action";

function anak(id: number, nama: string, counts: {
  absensi: number; nilai: number; sikap: number; tahsin: number; hafalan: number;
}) {
  return {
    id,
    nis: `S-${id}`,
    nama,
    statusTahfidz: true,
    kelas: { nama: "VIII A" },
    _count: counts,
  };
}

describe("monitoring anak dan dashboard wali murid (US-16, US-17)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "ortu-1", role: "ORANGTUA" } });
    mocks.transaction.mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries));
    mocks.absensiFindMany.mockResolvedValue([]);
    mocks.nilaiFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mocks.sikapFindMany.mockResolvedValue([]);
    mocks.tahsinFindMany.mockResolvedValue([]);
    mocks.hafalanFindMany.mockResolvedValue([]);
  });

  it("menolak akses resolusi anak jika pengguna bukan wali murid", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });

    const result = await resolveAnak(10);

    expect(result).toBeNull();
    expect(mocks.siswaFindFirst).not.toHaveBeenCalled();
  });

  it("membatasi pencarian anak berdasarkan wali yang login dan ID anak yang diminta", async () => {
    mocks.siswaFindFirst.mockResolvedValue(null);

    const result = await resolveAnak(99);

    expect(result).toBeNull();
    expect(mocks.siswaFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { orangTuaId: "ortu-1", status: true, id: 99 },
    }));
  });

  it("menjumlah monitoring semua anak, memilih anak aktif, dan menyusun aktivitas terbaru", async () => {
    const now = new Date();
    const oneMinuteEarlier = new Date(now.getTime() - 60_000);
    mocks.orangTuaFindUnique.mockResolvedValue({
      user: { name: "Ibu Alya" },
      anak: [
        anak(10, "Alya", { absensi: 3, nilai: 2, sikap: 1, tahsin: 4, hafalan: 5 }),
        anak(11, "Bima", { absensi: 1, nilai: 3, sikap: 2, tahsin: 1, hafalan: 0 }),
      ],
    });
    mocks.absensiFindMany.mockResolvedValue([{
      id: 1,
      status: "HADIR",
      createdAt: now,
      siswa: { id: 10, nama: "Alya" },
      jadwal: { mataPelajaran: { namaMapel: "IPA" } },
    }]);
    mocks.nilaiFindMany
      .mockReset()
      .mockResolvedValueOnce([{
        id: 2,
        jenis: "HARIAN",
        nilai: "88",
        tanggal: oneMinuteEarlier,
        siswa: { id: 10, nama: "Alya" },
        guruMapel: { mataPelajaran: { namaMapel: "IPA" } },
      }])
      .mockResolvedValueOnce([
        { nilai: "80", tanggal: now },
        { nilai: "90", tanggal: now },
      ]);

    const result = await getDashboardOrangTua(11);

    expect(result).not.toBeNull();
    expect(result?.anakAktifId).toBe(11);
    expect(result?.anakAktifNama).toBe("Bima");
    expect(result?.ringkasanJumlah).toEqual({
      absensi: 4,
      nilai: 5,
      sikap: 3,
      tahsin: 5,
      hafalan: 5,
      monitoring: 22,
    });
    expect(result?.nilaiPerkembangan).toHaveLength(6);
    expect(result?.nilaiPerkembangan[5].jumlah).toBe(85);
    expect(result?.monitoringTerbaru[0]).toEqual(expect.objectContaining({
      jenis: "Absensi",
      judul: "HADIR",
      href: "/orangtua/absensi?siswaId=10",
    }));
  });
});