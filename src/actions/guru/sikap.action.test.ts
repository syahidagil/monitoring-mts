import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  jadwalFindMany: vi.fn(),
  siswaFindUnique: vi.fn(),
  tahunAjaranFindFirst: vi.fn(),
  sikapCreate: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    jadwal: { findMany: mocks.jadwalFindMany },
    siswa: { findUnique: mocks.siswaFindUnique },
    tahunAjaran: { findFirst: mocks.tahunAjaranFindFirst },
    sikap: { create: mocks.sikapCreate },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createSikap } from "./sikap.action";

function sikapForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    siswaId: "10",
    jenisSikap: "POSITIF",
    kategori: "Kedisiplinan",
    keterangan: "Selalu datang tepat waktu",
    tanggal: "2026-10-02",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("input sikap siswa (US-12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.jadwalFindMany.mockResolvedValue([{ kelasId: 2 }]);
    mocks.siswaFindUnique.mockResolvedValue({ kelasId: 2 });
    mocks.tahunAjaranFindFirst.mockResolvedValue({ nama: "2026/2027", semester: "GANJIL" });
    mocks.sikapCreate.mockResolvedValue({ id: 30 });
  });

  it("menolak keterangan yang kurang dari sepuluh karakter", async () => {
    const result = await createSikap(sikapForm({ keterangan: "Baik" }));

    expect(result.success).toBe(false);
    expect(mocks.siswaFindUnique).not.toHaveBeenCalled();
    expect(mocks.sikapCreate).not.toHaveBeenCalled();
  });

  it("menolak siswa yang bukan berasal dari kelas yang diajar guru", async () => {
    mocks.siswaFindUnique.mockResolvedValue({ kelasId: 99 });

    const result = await createSikap(sikapForm());

    expect(result).toEqual({ success: false, message: "Siswa bukan dari kelas yang Anda ajar" });
    expect(mocks.sikapCreate).not.toHaveBeenCalled();
  });

  it("menyimpan catatan sikap untuk siswa di kelas guru dan semester aktif", async () => {
    const result = await createSikap(sikapForm());

    expect(mocks.sikapCreate).toHaveBeenCalledWith({
      data: {
        siswaId: 10,
        guruId: "guru-1",
        tanggal: new Date("2026-10-02"),
        jenisSikap: "POSITIF",
        kategori: "Kedisiplinan",
        keterangan: "Selalu datang tepat waktu",
        semester: "GANJIL",
        tahunAjar: "2026/2027",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/guru/sikap");
    expect(result).toEqual({ success: true, message: "Catatan sikap berhasil disimpan" });
  });
});