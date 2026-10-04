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

import { createKelas, updateKelas } from "./kelas.action";

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

  it("memperbarui kelas yang sudah ada", async () => {
    mocks.findFirst.mockResolvedValue(null);

    const result = await updateKelas(12, kelasForm("IX B"));

    expect(mocks.update).toHaveBeenCalledWith({ where: { id: 12 }, data: {
      nama: "IX B", tingkat: 9, tahunAjaranId: 3, waliKelasId: "guru-1",
    } });
    expect(result.success).toBe(true);
  });

});