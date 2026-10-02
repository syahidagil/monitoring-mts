import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  jadwalFindFirst: vi.fn(),
  jadwalFindUnique: vi.fn(),
  jadwalCreate: vi.fn(),
  jadwalUpdate: vi.fn(),
  jadwalDelete: vi.fn(),
  absensiCount: vi.fn(),
  guruMapelFindFirst: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    jadwal: {
      findFirst: mocks.jadwalFindFirst,
      findUnique: mocks.jadwalFindUnique,
      create: mocks.jadwalCreate,
      update: mocks.jadwalUpdate,
      delete: mocks.jadwalDelete,
    },
    absensi: { count: mocks.absensiCount },
    guruMapel: { findFirst: mocks.guruMapelFindFirst },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createJadwal, deleteJadwal, updateJadwal } from "./jadwal.action";

function jadwalForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    hari: "SENIN",
    kodeMapel: "IPA",
    jamMulai: "08:00",
    jamSelesai: "09:00",
    guruId: "guru-1",
    kelasId: "2",
    tahunAjaranId: "3",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("kelola jadwal pelajaran (US-08)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.jadwalFindFirst.mockResolvedValue(null);
    mocks.guruMapelFindFirst.mockResolvedValue({ idGuru: "guru-1", kodeMapel: "IPA" });
    mocks.absensiCount.mockResolvedValue(0);
  });

  it("menolak jadwal dengan jam mulai yang tidak lebih awal dari jam selesai", async () => {
    const result = await createJadwal(jadwalForm({ jamMulai: "09:00", jamSelesai: "08:00" }));

    expect(result.success).toBe(false);
    expect(mocks.jadwalFindFirst).not.toHaveBeenCalled();
    expect(mocks.jadwalCreate).not.toHaveBeenCalled();
  });

  it("menolak jadwal yang bertabrakan dengan jadwal kelas", async () => {
    mocks.jadwalFindFirst.mockResolvedValueOnce({
      kelas: { nama: "VIII A" },
      jamMulai: "08:30",
      jamSelesai: "09:30",
    });

    const result = await createJadwal(jadwalForm());

    expect(result).toEqual({
      success: false,
      message: "Kelas VIII A sudah memiliki jadwal pada hari SENIN jam 08:30-09:30",
    });
    expect(mocks.jadwalCreate).not.toHaveBeenCalled();
  });

  it("menolak jadwal yang bertabrakan dengan jadwal guru", async () => {
    mocks.jadwalFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        guru: { user: { name: "Budi" } },
        kelas: { nama: "VIII B" },
        jamMulai: "08:30",
        jamSelesai: "09:30",
      });

    const result = await createJadwal(jadwalForm());

    expect(result).toEqual({
      success: false,
      message: "Guru Budi sudah mengajar kelas VIII B pada hari SENIN jam 08:30-09:30",
    });
    expect(mocks.jadwalCreate).not.toHaveBeenCalled();
  });

  it("membuat jadwal valid dan memperbarui halaman admin", async () => {
    const result = await createJadwal(jadwalForm());

    expect(mocks.jadwalCreate).toHaveBeenCalledWith({
      data: {
        hari: "SENIN",
        kodeMapel: "IPA",
        jamMulai: "08:00",
        jamSelesai: "09:00",
        guruId: "guru-1",
        kelasId: 2,
        tahunAjaranId: 3,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/jadwal");
    expect(result).toEqual({ success: true, message: "Jadwal berhasil ditambahkan", warning: undefined });
  });

  it("mencegah perubahan hari atau waktu jika jadwal sudah memiliki absensi", async () => {
    mocks.jadwalFindUnique.mockResolvedValue({
      hari: "SENIN",
      jamMulai: "08:00",
      jamSelesai: "09:00",
      kelasId: 2,
    });
    mocks.absensiCount.mockResolvedValue(2);

    const result = await updateJadwal(10, jadwalForm({ hari: "SELASA" }));

    expect(result).toEqual({
      success: false,
      message: "Jadwal sudah memiliki 2 data absensi, tidak dapat mengubah hari/waktu/kelas",
    });
    expect(mocks.jadwalUpdate).not.toHaveBeenCalled();
  });

  it("mencegah penghapusan jadwal yang sudah memiliki absensi", async () => {
    mocks.absensiCount.mockResolvedValue(1);

    const result = await deleteJadwal(10);

    expect(result).toEqual({
      success: false,
      message: "Jadwal tidak bisa dihapus karena sudah memiliki 1 data absensi",
    });
    expect(mocks.jadwalDelete).not.toHaveBeenCalled();
  });

  it("menghapus jadwal yang belum memiliki absensi", async () => {
    const result = await deleteJadwal(10);

    expect(mocks.jadwalDelete).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(result).toEqual({ success: true, message: "Jadwal berhasil dihapus" });
  });
});