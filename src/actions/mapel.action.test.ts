import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(),
  count: vi.fn(), delete: vi.fn(), revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  mataPelajaran: { findUnique: mocks.findUnique, findFirst: mocks.findFirst, create: mocks.create, update: mocks.update, delete: mocks.delete },
  guruMapel: { count: mocks.count },
} }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createMapel, updateMapel } from "./mapel.action";

function mapelForm(kodeMapel = "ipa", namaMapel = "Ilmu Pengetahuan Alam") {
  const form = new FormData();
  form.set("kodeMapel", kodeMapel);
  form.set("namaMapel", namaMapel);
  return form;
}

describe("CRUD mata pelajaran (US-06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
  });

  it("menyimpan kode mapel dalam huruf kapital", async () => {
    mocks.findUnique.mockResolvedValue(null);
    mocks.findFirst.mockResolvedValue(null);

    const result = await createMapel(mapelForm());

    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { kodeMapel: "IPA" } });
    expect(mocks.create).toHaveBeenCalledWith({ data: { kodeMapel: "IPA", namaMapel: "Ilmu Pengetahuan Alam" } });
    expect(result.success).toBe(true);
  });

  it("memperbarui nama mata pelajaran", async () => {
    const result = await updateMapel("IPA", "  IPA Terpadu  ");

    expect(mocks.update).toHaveBeenCalledWith({ where: { kodeMapel: "IPA" }, data: { namaMapel: "IPA Terpadu" } });
    expect(result.success).toBe(true);
  });

});