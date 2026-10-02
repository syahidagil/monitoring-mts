import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    informasiSekolah: {
      create: mocks.create,
      update: mocks.update,
      delete: mocks.delete,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { deleteSchoolInfo, upsertSchoolInfo } from "./schoolInfo";

function validSchoolInfoForm() {
  const formData = new FormData();
  formData.set("kategori", "SEJARAH");
  formData.set("judul", "Sejarah Madrasah");
  formData.set("isi", "Informasi sejarah sekolah.");
  return formData;
}

describe("school information actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menolak penyimpanan oleh pengguna yang bukan admin", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1", role: "GURU" } });

    const result = await upsertSchoolInfo(validSchoolInfoForm());

    expect(result).toEqual({ success: false, message: "Tidak diizinkan" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menolak informasi dengan judul kosong sebelum menulis ke database", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    const formData = validSchoolInfoForm();
    formData.set("judul", "");

    const result = await upsertSchoolInfo(formData);

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("membuat informasi sekolah yang valid dan memperbarui halaman terkait", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mocks.create.mockResolvedValue({});

    const result = await upsertSchoolInfo(validSchoolInfoForm());

    expect(result).toEqual({ success: true, message: "Berhasil disimpan" });
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        kategori: "SEJARAH",
        judul: "Sejarah Madrasah",
        isi: "Informasi sejarah sekolah.",
        idUser: "admin-1",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/informasi");
  });

  it("menghapus informasi sekolah setelah otorisasi admin", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mocks.delete.mockResolvedValue({});

    const result = await deleteSchoolInfo(12);

    expect(mocks.delete).toHaveBeenCalledWith({ where: { idInfo: 12 } });
    expect(result).toEqual({ success: true, message: "Berhasil dihapus" });
  });
});