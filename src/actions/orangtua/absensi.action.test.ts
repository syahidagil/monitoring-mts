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

function baris(
  id: number,
  tanggal: Date,
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPA",
  kodeMapel: string,
  namaMapel: string,
  keterangan: string | null = null
) {
  return {
    id,
    tanggal,
    status,
    keterangan,
    jadwal: { kodeMapel, mataPelajaran: { namaMapel } },
  };
}

describe("monitoring absensi anak (US-16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAnak.mockResolvedValue(anakFixture);
    mocks.tahunAjaranFindMany.mockResolvedValue([
      { id: 3, nama: "2026/2027", semester: "GANJIL", aktif: true },
    ]);
    mocks.absensiFindMany.mockResolvedValue([
      baris(1, new Date(2026, 9, 1), "HADIR", "MTK", "Matematika"),
      baris(2, new Date(2026, 9, 2), "SAKIT", "MTK", "Matematika", "Demam"),
      baris(3, new Date(2026, 8, 30), "ALPA", "IPA", "IPA"),
    ]);
  });

  it("mengembalikan null jika siswa bukan anak yang dapat diakses wali", async () => {
    mocks.resolveAnak.mockResolvedValue(null);

    const result = await getAbsensiAnak({ siswaId: 99, bulan: 10 });

    expect(result).toBeNull();
    expect(mocks.absensiFindMany).not.toHaveBeenCalled();
  });

  it("menghitung status absensi dan persentase hadir untuk bulan terpilih", async () => {
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

  it("daftar mata pelajaran berisi semua mapel pada semester itu, terurut menurut nama", async () => {
    const result = await getAbsensiAnak({ siswaId: 10, bulan: 10 });

    expect(result?.mapelList).toEqual([
      { kodeMapel: "IPA", nama: "IPA" },
      { kodeMapel: "MTK", nama: "Matematika" },
    ]);
  });

  it("membatasi data ke mata pelajaran yang dipilih", async () => {
    const result = await getAbsensiAnak({ siswaId: 10, bulan: 0, kodeMapel: "IPA" });

    expect(result?.kodeMapel).toBe("IPA");
    expect(result?.rekap).toEqual({ HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 1 });
    expect(result?.rows).toHaveLength(1);
  });

  it("bulan 0 menampilkan semua bulan pada semester itu", async () => {
    const result = await getAbsensiAnak({ siswaId: 10, bulan: 0 });

    expect(result?.bulan).toBe(0);
    expect(result?.rows).toHaveLength(3);
    expect(result?.rekap).toEqual({ HADIR: 1, SAKIT: 1, IZIN: 0, ALPA: 1 });
    expect(result?.persentase).toBe(33);
  });

  it("mengabaikan kode mapel yang tidak ada pada data anak", async () => {
    const result = await getAbsensiAnak({ siswaId: 10, bulan: 0, kodeMapel: "XYZ" });

    expect(result?.kodeMapel).toBeNull();
    expect(result?.rows).toHaveLength(3);
  });
});