import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    user: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    guru: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    guruMapel: { createMany: vi.fn(), deleteMany: vi.fn() },
  };
  return {
    auth: vi.fn(),
    userFindUnique: vi.fn(),
    guruFindUnique: vi.fn(),
    guruFindFirst: vi.fn(),
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
    guru: {
      findUnique: mocks.guruFindUnique,
      findFirst: mocks.guruFindFirst,
    },
    $transaction: mocks.transaction,
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("bcryptjs", () => ({ default: { hash: mocks.hash } }));

import { createGuru, updateGuru } from "./guru.action";

function guruForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    username: "guru01",
    password: "rahasia123",
    nama: "Budi Santoso",
    nip: "NIP-001",
    kodeGuru: "G-001",
    status: "true",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  formData.append("kodeMapel", "IPA");
  formData.append("mapelNama", "Ilmu Pengetahuan Alam");
  return formData;
}

describe("CRUD guru (US-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.transaction.mockImplementation(async (callback) => callback(mocks.tx));
  });

  it("menolak pembuatan guru oleh pengguna non-admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "GURU" } });

    const result = await createGuru(guruForm());

    expect(result).toEqual({ success: false, message: "Tidak diizinkan" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("menolak password yang kurang dari enam karakter", async () => {
    const result = await createGuru(guruForm({ password: "123" }));

    expect(result).toEqual({ success: false, message: "Password minimal 6 karakter" });
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("menolak username yang sudah digunakan", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "user-existing" });

    const result = await createGuru(guruForm());

    expect(result).toEqual({ success: false, message: "Username sudah digunakan" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("membuat user, profil guru, dan relasi mata pelajaran", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.guruFindUnique.mockResolvedValue(null);
    mocks.tx.user.create.mockResolvedValue({ id: "guru-1" });

    const result = await createGuru(guruForm());

    expect(mocks.hash).toHaveBeenCalledWith("rahasia123", 12);
    expect(mocks.tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ username: "guru01", password: "hashed-password", role: "GURU" }),
    });
    expect(mocks.tx.guru.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: "guru-1", kodeGuru: "G-001", mapel: "Ilmu Pengetahuan Alam" }),
    });
    expect(mocks.tx.guruMapel.createMany).toHaveBeenCalledWith({
      data: [{ idGuru: "guru-1", kodeMapel: "IPA" }],
      skipDuplicates: true,
    });
    expect(result).toEqual({ success: true, message: "Guru berhasil ditambahkan" });
  });

  it("memperbarui nama dan mata pelajaran guru", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "guru-1", username: "guru01" });
    mocks.guruFindFirst.mockResolvedValue(null);
    const formData = guruForm({ nama: "Budi Baru", mapel: "IPA Terpadu" });

    const result = await updateGuru("guru-1", formData);

    expect(mocks.tx.user.update).toHaveBeenCalledWith({
      where: { id: "guru-1" },
      data: expect.objectContaining({ name: "Budi Baru" }),
    });
    expect(mocks.tx.guru.update).toHaveBeenCalledWith({
      where: { id: "guru-1" },
      data: expect.objectContaining({ mapel: "IPA Terpadu" }),
    });
    expect(result).toEqual({ success: true, message: "Data guru berhasil diperbarui" });
  });
});