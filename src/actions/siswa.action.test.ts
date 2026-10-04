import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findForDelete: vi.fn(),
  delete: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { siswa: {
    findUnique: mocks.findUnique,
    findFirst: mocks.findFirst,
    create: mocks.create,
    update: mocks.update,
    delete: mocks.delete,
  } },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createSiswa, updateSiswa } from "./siswa.action";

function siswaForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({
    nis: " S-100 ", nama: " Alya Putri ", jenisKelamin: "Perempuan",
    tanggalLahir: "2012-05-20", kelasId: "2", statusTahfidz: "true", status: "true",
    ...overrides,
  }).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("CRUD siswa (US-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
  });

  it("menambahkan siswa dengan data yang dinormalisasi", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await createSiswa(siswaForm());

    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      nis: "S-100", nama: "Alya Putri", jenisKelamin: "P", kelasId: 2,
      statusTahfidz: true, tanggalLahir: new Date("2012-05-20"),
    }) });
    expect(result).toEqual({ success: true, message: "Siswa berhasil ditambahkan" });
  });

  it("memperbarui data siswa dan menginvalidasi halaman admin", async () => {
    mocks.findFirst.mockResolvedValue(null);

    const result = await updateSiswa(8, siswaForm({ nis: "S-101" }));

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 8 }, data: expect.objectContaining({ nis: "S-101", nama: "Alya Putri" }),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/data-siswa");
    expect(result.success).toBe(true);
  });

});