import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { tahsin: { create: mocks.create } } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createTahsin } from "./tahsin.action";

function tahsinForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    siswaId: "12",
    nomorSurat: "2",
    surat: "Al-Baqarah",
    juz: "1",
    ayatMulai: "1",
    ayatSelesai: "5",
    halaman: "2",
    tajwid: "L",
    makhraj: "L_MIN",
    sifatul: "L",
    tanggal: "2026-10-02",
    keterangan: "Bacaan cukup lancar",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("input tahsin (US-14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.create.mockResolvedValue({ id: 50 });
  });

  it("menolak nilai aspek tajwid yang tidak valid", async () => {
    const result = await createTahsin(tahsinForm({ tajwid: "A" }));

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menolak rentang ayat yang tidak valid", async () => {
    const result = await createTahsin(tahsinForm({ ayatMulai: "8", ayatSelesai: "4" }));

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("menyimpan penilaian tahsin dengan guru dari sesi dan aspek yang dipilih", async () => {
    const result = await createTahsin(tahsinForm());

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        siswaId: 12,
        guruId: "guru-1",
        nomorSurat: 2,
        surat: "Al-Baqarah",
        ayatMulai: 1,
        ayatSelesai: 5,
        tajwid: "L",
        makhraj: "L_MIN",
        sifatul: "L",
        tanggal: new Date("2026-10-02"),
        keterangan: "Bacaan cukup lancar",
      }),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/guru/tahsin");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/guru/tahsin/12");
    expect(result).toEqual({ success: true, message: "Data tahsin berhasil disimpan" });
  });
});