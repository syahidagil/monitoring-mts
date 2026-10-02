import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  kelasCount: vi.fn(),
  jadwalCount: vi.fn(),
  transaction: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tahunAjaran: {
      findFirst: mocks.findFirst,
      findUnique: mocks.findUnique,
      findMany: mocks.findMany,
      count: mocks.count,
      create: mocks.create,
      update: mocks.update,
      updateMany: mocks.updateMany,
      delete: mocks.delete,
    },
    kelas: { count: mocks.kelasCount },
    jadwal: { count: mocks.jadwalCount },
    $transaction: mocks.transaction,
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createTahunPelajaran,
  deleteTahunPelajaran,
  setTahunPelajaranAktif,
  updateTahunPelajaran,
} from "./tahunAjaran.action";

function tahunPelajaranForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({ nama: "2025/2026", semester: "GANJIL", ...overrides })
    .forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("kelola tahun pelajaran (US-07)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.findFirst.mockResolvedValue(null);
    mocks.count.mockResolvedValue(1);
    mocks.kelasCount.mockResolvedValue(0);
    mocks.jadwalCount.mockResolvedValue(0);
  });

  it("menolak format tahun pelajaran yang tidak berurutan", async () => {
    const result = await createTahunPelajaran(tahunPelajaranForm({ nama: "2025/2027" }));

    expect(result.success).toBe(false);
    expect(mocks.findFirst).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menandai tahun pelajaran pertama sebagai aktif", async () => {
    mocks.count.mockResolvedValue(0);

    const result = await createTahunPelajaran(tahunPelajaranForm());

    expect(mocks.create).toHaveBeenCalledWith({
      data: { nama: "2025/2026", semester: "GANJIL", aktif: true },
    });
    expect(result).toEqual({
      success: true,
      message: "Tahun pelajaran berhasil ditambahkan dan otomatis diaktifkan",
    });
  });

  it("menolak kombinasi tahun pelajaran dan semester yang sudah ada", async () => {
    mocks.findFirst.mockResolvedValue({ id: 1 });

    const result = await createTahunPelajaran(tahunPelajaranForm());

    expect(result).toEqual({
      success: false,
      message: "Tahun pelajaran 2025/2026 Semester GANJIL sudah ada",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("memperbarui tahun pelajaran jika tidak ada jadwal terkait", async () => {
    const result = await updateTahunPelajaran(4, tahunPelajaranForm({ nama: "2026/2027" }));

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { nama: "2026/2027", semester: "GANJIL" },
    });
    expect(result).toEqual({ success: true, message: "Tahun pelajaran berhasil diperbarui" });
  });

  it("mencegah perubahan tahun pelajaran yang sudah memiliki jadwal", async () => {
    mocks.kelasCount.mockResolvedValue(1);
    mocks.jadwalCount.mockResolvedValue(2);

    const result = await updateTahunPelajaran(4, tahunPelajaranForm({ nama: "2026/2027" }));

    expect(result).toEqual({
      success: false,
      message: "Tahun pelajaran sudah memiliki 2 jadwal, tidak dapat diubah",
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("mencegah penghapusan tahun pelajaran yang sedang aktif", async () => {
    mocks.findUnique.mockResolvedValue({ aktif: true, _count: { kelas: 0 } });

    const result = await deleteTahunPelajaran(4);

    expect(result).toEqual({
      success: false,
      message: "Tidak bisa menghapus tahun pelajaran yang sedang aktif. Nonaktifkan terlebih dahulu.",
    });
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("mengaktifkan tahun pelajaran yang dipilih dan memperbarui halaman terkait", async () => {
    mocks.findUnique.mockResolvedValue({ id: 4, aktif: false });

    const result = await setTahunPelajaranAktif(4);

    expect(mocks.updateMany).toHaveBeenCalledWith({ data: { aktif: false } });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: 4 }, data: { aktif: true } });
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/tahun-pelajaran");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/jadwal");
    expect(result).toEqual({ success: true, message: "Tahun pelajaran berhasil diaktifkan" });
  });
});