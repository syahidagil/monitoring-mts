import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  upsertAbsensi: vi.fn(),
  upsertCatatan: vi.fn(),
  deleteCatatan: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    absensi: { upsert: mocks.upsertAbsensi },
    absensiCatatanUmum: {
      upsert: mocks.upsertCatatan,
      deleteMany: mocks.deleteCatatan,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { saveAbsensiKelas } from "./absensi.action";

function absensiForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({ jadwalId: "8", tanggal: "2026-10-02", ...overrides })
    .forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("input absensi siswa (US-10)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.upsertAbsensi.mockResolvedValue({});
    mocks.upsertCatatan.mockResolvedValue({});
    mocks.deleteCatatan.mockResolvedValue({ count: 0 });
  });

  it("menolak pengguna yang bukan guru", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const result = await saveAbsensiKelas(absensiForm({ status_10: "HADIR" }));

    expect(result).toEqual({ success: false, message: "Tidak diizinkan" });
    expect(mocks.upsertAbsensi).not.toHaveBeenCalled();
  });

  it("menolak data absensi tanpa jadwal atau tanggal", async () => {
    const result = await saveAbsensiKelas(absensiForm({ jadwalId: "", tanggal: "" }));

    expect(result).toEqual({ success: false, message: "Data tidak lengkap" });
    expect(mocks.upsertAbsensi).not.toHaveBeenCalled();
  });

  it("menolak penyimpanan jika tidak ada status siswa", async () => {
    const result = await saveAbsensiKelas(absensiForm());

    expect(result).toEqual({ success: false, message: "Tidak ada data siswa" });
    expect(mocks.upsertAbsensi).not.toHaveBeenCalled();
  });

  it("menyimpan status siswa dan catatan umum", async () => {
    const formData = absensiForm({ catatanUmum: "  Kegiatan belajar berjalan baik  " });
    formData.set("status_10", "HADIR");
    formData.set("ket_10", "Tepat waktu");
    formData.set("status_11", "SAKIT");

    const result = await saveAbsensiKelas(formData);

    expect(mocks.upsertAbsensi).toHaveBeenCalledTimes(2);
    expect(mocks.upsertAbsensi).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswaId_jadwalId_tanggal: {
        siswaId: 10, jadwalId: 8, tanggal: new Date("2026-10-02"),
      } },
      create: expect.objectContaining({ siswaId: 10, guruId: "guru-1", status: "HADIR", keterangan: "Tepat waktu" }),
    }));
    expect(mocks.upsertCatatan).toHaveBeenCalledWith(expect.objectContaining({
      update: { catatan: "Kegiatan belajar berjalan baik" },
    }));
    expect(result).toEqual({ success: true, message: "Absensi 2 siswa berhasil disimpan" });
  });

  it("menghapus catatan umum sesi saat catatan dikosongkan", async () => {
    const formData = absensiForm();
    formData.set("status_10", "IZIN");

    await saveAbsensiKelas(formData);

    expect(mocks.deleteCatatan).toHaveBeenCalledWith({
      where: { jadwalId: 8, tanggal: new Date("2026-10-02") },
    });
  });
});