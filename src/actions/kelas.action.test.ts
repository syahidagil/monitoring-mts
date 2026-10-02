import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { kelas: {
  findFirst: mocks.findFirst, findUnique: mocks.findUnique, create: mocks.create,
  update: mocks.update, delete: mocks.delete,
} } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createKelas, deleteKelas, updateKelas } from "./kelas.action";

function kelasForm(nama = "VIII A") {
  const form = new FormData();
  form.set("nama", nama);
  form.set("tahunAjaranId", "3");
  form.set("waliKelasId", "guru-1");
  return form;
}

describe("CRUD kelas (US-05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
  });

  it("membuat kelas dan menentukan tingkat dari nama kelas", async () => {
    mocks.findFirst.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ id: 12 });

    const result = await createKelas(kelasForm());

    expect(mocks.create).toHaveBeenCalledWith({ data: {
      nama: "VIII A", tingkat: 8, tahunAjaranId: 3, waliKelasId: "guru-1",
    } });
    expect(result.success).toBe(true);
  });

  it("menolak kelas yang sudah ada pada tahun ajaran yang sama", async () => {
    mocks.findFirst.mockResolvedValue({ id: 2 });

    const result = await createKelas(kelasForm());

    expect(result).toEqual({ success: false, message: "Kelas VIII A sudah ada di tahun ajaran ini" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("memperbarui kelas yang sudah ada", async () => {
    mocks.findFirst.mockResolvedValue(null);

    const result = await updateKelas(12, kelasForm("IX B"));

    expect(mocks.update).toHaveBeenCalledWith({ where: { id: 12 }, data: {
      nama: "IX B", tingkat: 9, tahunAjaranId: 3, waliKelasId: "guru-1",
    } });
    expect(result.success).toBe(true);
  });

  it("mencegah penghapusan kelas yang masih memiliki siswa", async () => {
    mocks.findUnique.mockResolvedValue({ _count: { siswa: 2, jadwal: 0 } });

    const result = await deleteKelas(12);

    expect(result).toEqual({ success: false, message: "Kelas masih memiliki 2 siswa. Pindahkan siswa terlebih dahulu." });
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});