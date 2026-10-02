import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  jadwalFindUnique: vi.fn(),
  guruMapelFindUnique: vi.fn(),
  nilaiFindMany: vi.fn(),
  nilaiUpsert: vi.fn(),
  nilaiCreate: vi.fn(),
  nilaiUpdate: vi.fn(),
  transaction: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    jadwal: { findUnique: mocks.jadwalFindUnique },
    guruMapel: { findUnique: mocks.guruMapelFindUnique },
    nilai: {
      findMany: mocks.nilaiFindMany,
      upsert: mocks.nilaiUpsert,
      create: mocks.nilaiCreate,
      update: mocks.nilaiUpdate,
    },
    $transaction: mocks.transaction,
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { saveNilaiBatch } from "./nilai.action";

function nilaiForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  Object.entries({
    jadwalId: "8",
    jenis: "HARIAN",
    tanggal: "2026-10-02",
    keterangan: "Ulangan bab 1",
    ...overrides,
  }).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("input nilai siswa (US-11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "guru-1", role: "GURU" } });
    mocks.jadwalFindUnique.mockResolvedValue({
      id: 8,
      guruId: "guru-1",
      kodeMapel: "IPA",
      kelasId: 2,
      kelas: { nama: "VIII A", siswa: [{ id: 10 }, { id: 11 }] },
      tahunAjaran: { nama: "2026/2027", semester: "GANJIL" },
    });
    mocks.guruMapelFindUnique.mockResolvedValue({ idGuruMapel: 4 });
    mocks.nilaiUpsert.mockResolvedValue({});
    mocks.transaction.mockResolvedValue([]);
  });

  it("menolak akses pengguna yang bukan guru", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const result = await saveNilaiBatch(nilaiForm({ nilai_10: "85" }));

    expect(result).toEqual({ success: false, message: "Tidak diizinkan" });
    expect(mocks.jadwalFindUnique).not.toHaveBeenCalled();
  });

  it("menolak input nilai di luar rentang 0 sampai 100", async () => {
    const result = await saveNilaiBatch(nilaiForm({ nilai_10: "101" }));

    expect(result).toEqual({
      success: false,
      message: "Nilai tidak valid (harus 0-100) pada salah satu siswa",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("melewati kolom kosong dan menyimpan nilai valid untuk siswa di kelas jadwal", async () => {
    const formData = nilaiForm({ nilai_10: "85", nilai_11: "" });

    const result = await saveNilaiBatch(formData);

    expect(mocks.nilaiUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { siswaId_guruMapelId_jenis_semester_tahunAjar_tanggal: {
        siswaId: 10,
        guruMapelId: 4,
        jenis: "HARIAN",
        semester: "GANJIL",
        tahunAjar: "2026/2027",
        tanggal: new Date("2026-10-02"),
      } },
      create: expect.objectContaining({ siswaId: 10, guruId: "guru-1", nilai: 85 }),
    }));
    expect(mocks.nilaiUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(result).toEqual({
      success: true,
      message: "1 nilai HARIAN berhasil disimpan untuk tanggal ini",
    });
  });

  it("menolak input jika jadwal bukan milik guru yang sedang login", async () => {
    mocks.jadwalFindUnique.mockResolvedValue({
      guruId: "guru-lain",
      kodeMapel: "IPA",
    });

    const result = await saveNilaiBatch(nilaiForm({ nilai_10: "85" }));

    expect(result).toEqual({ success: false, message: "Jadwal tidak valid" });
    expect(mocks.nilaiUpsert).not.toHaveBeenCalled();
  });
});