import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    user: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    orangTua: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    siswa: { updateMany: vi.fn() },
  };
  return {
    auth: vi.fn(),
    userFindUnique: vi.fn(),
    transaction: vi.fn(),
    hash: vi.fn(),
    revalidatePath: vi.fn(),
    tx,
  };
});

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    $transaction: mocks.transaction,
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("bcryptjs", () => ({ default: { hash: mocks.hash } }));

import { createOrangTua, updateOrangTua } from "./orangtua.action";

function orangTuaForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    nama: "Siti Aminah",
    username: "siti.aminah",
    password: "rahasia123",
    noHp: "081234567890",
    alamat: "Jl. Melati",
    pekerjaan: "Wiraswasta",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  formData.append("siswaIds", "12");
  return formData;
}

describe("CRUD wali murid (US-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.transaction.mockImplementation(async (callback) => callback(mocks.tx));
  });

  it("membuat akun wali murid dan menghubungkan siswa yang dipilih", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.tx.user.create.mockResolvedValue({ id: "ortu-1" });

    const result = await createOrangTua(orangTuaForm());

    expect(mocks.hash).toHaveBeenCalledWith("rahasia123", 12);
    expect(mocks.tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ username: "siti.aminah", password: "hashed-password", role: "ORANGTUA" }),
    });
    expect(mocks.tx.orangTua.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: "ortu-1", pekerjaan: "Wiraswasta" }),
    });
    expect(mocks.tx.siswa.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [12] } },
      data: { orangTuaId: "ortu-1" },
    });
    expect(result).toEqual({ success: true, message: "Orang tua berhasil ditambahkan" });
  });

  it("memperbarui data wali murid dan mengganti relasi anak", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "ortu-1", username: "siti.aminah" });
    const formData = orangTuaForm({ nama: "Siti Aminah Baru" });
    formData.delete("siswaIds");
    formData.append("siswaIds", "15");

    const result = await updateOrangTua("ortu-1", formData);

    expect(mocks.tx.user.update).toHaveBeenCalledWith({
      where: { id: "ortu-1" },
      data: expect.objectContaining({ name: "Siti Aminah Baru" }),
    });
    expect(mocks.tx.siswa.updateMany).toHaveBeenNthCalledWith(1, {
      where: { orangTuaId: "ortu-1" },
      data: { orangTuaId: null },
    });
    expect(mocks.tx.siswa.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: { in: [15] } },
      data: { orangTuaId: "ortu-1" },
    });
    expect(result).toEqual({ success: true, message: "Data orang tua berhasil diperbarui" });
  });
});