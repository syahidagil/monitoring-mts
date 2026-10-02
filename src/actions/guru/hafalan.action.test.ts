import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { hafalan: { create: mocks.create } } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createHafalan } from "./hafalan.action";

function hafalanForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    siswaId: "10",
    nomorSurat: "1",
    surat: "Al-Fatihah",
    juz: "1",
    ayatMulai: "1",
    ayatSelesai: "7",
    halaman: "1",
    nilai: "L",
    keterangan: "Setoran lancar",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("input hafalan siswa (US-13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.create.mockResolvedValue({ id: 40 });
  });

  it("menolak rentang ayat jika ayat selesai lebih kecil dari ayat mulai", async () => {
    const result = await createHafalan(hafalanForm({ ayatMulai: "5", ayatSelesai: "3" }));

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menolak nilai hafalan yang bukan L atau L_MIN", async () => {
    const result = await createHafalan(hafalanForm({ nilai: "A" }));

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menyimpan data setoran dengan guru dari sesi login", async () => {
    const result = await createHafalan(hafalanForm());

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        siswaId: 10,
        guruId: "guru-1",
        nomorSurat: 1,
        surat: "Al-Fatihah",
        ayatMulai: 1,
        ayatSelesai: 7,
        nilai: "L",
        keterangan: "Setoran lancar",
        tanggal: expect.any(Date),
      }),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/guru/hafalan");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/guru/hafalan/10");
    expect(result).toEqual({ success: true, message: "Data hafalan berhasil disimpan" });
  });
});