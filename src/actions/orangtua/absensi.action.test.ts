import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveAnak: vi.fn(),
  tahunAjaranFindMany: vi.fn(),
  absensiFindMany: vi.fn(),
}));

vi.mock("./dashboard.action", () => ({ resolveAnak: mocks.resolveAnak }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tahunAjaran: { findMany: mocks.tahunAjaranFindMany },
    absensi: { findMany: mocks.absensiFindMany },
  },
}));

import { getAbsensiAnak } from "./absensi.action";

const anakFixture = {
  id: 10,
  nis: "S-10",
  nama: "Alya",
  statusTahfidz: false,
  kelas: { id: 2, nama: "VIII A", tahunAjaran: { id: 3, nama: "2026/2027", semester: "GANJIL" } },
};

describe("monitoring absensi anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue(anakFixture);
    mocks.tahunAjaranFindMany.mockResolvedValue([
      { id: 3, nama: "2026/2027", semester: "GANJIL", aktif: true },
    ]);
  });

  it("mengembalikan null jika siswa bukan anak yang dapat diakses wali", async () => {
    mocks.resolveAnak.mockResolvedValue(null);

    const result = await getAbsensiAnak({ siswaId: 99, bulan: 10 });

    expect(result).toBeNull();
    expect(mocks.absensiFindMany).not.toHaveBeenCalled();
  });

  it("menghitung status absensi dan persentase hadir untuk bulan terpilih", async () => {
    mocks.absensiFindMany.mockResolvedValue([
      { id: 1, tanggal: new Date(2026, 9, 1), status: "HADIR", keterangan: null, jadwal: { mataPelajaran: { namaMapel: "IPA" } } },
      { id: 2, tanggal: new Date(2026, 9, 2), status: "SAKIT", keterangan: "Demam", jadwal: { mataPelajaran: { namaMapel: "IPA" } } },
      { id: 3, tanggal: new Date(2026, 8, 30), status: "ALPA", keterangan: null, jadwal: { mataPelajaran: { namaMapel: "IPS" } } },
    ]);

    const result = await getAbsensiAnak({ siswaId: 10, bulan: 10 });

    expect(mocks.absensiFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        siswaId: 10,
        jadwal: { tahunAjaran: { nama: "2026/2027", semester: "GANJIL" } },
      },
    }));
    expect(result?.rekap).toEqual({ HADIR: 1, SAKIT: 1, IZIN: 0, ALPA: 0 });
    expect(result?.persentase).toBe(50);
    expect(result?.rows).toHaveLength(2);
    expect(result?.rows[1].keterangan).toBe("Demam");
  });
});