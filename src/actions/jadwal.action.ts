"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { jadwalSchema } from "@/lib/validations/jadwal.validation";

// ─── HELPER: cek overlap waktu ────────────────────────────────────────────────
function overlapCondition(jamMulai: string, jamSelesai: string) {
  return [
    { jamMulai: { lte: jamMulai }, jamSelesai: { gt: jamMulai } },
    { jamMulai: { lt: jamSelesai }, jamSelesai: { gte: jamSelesai } },
    { jamMulai: { gte: jamMulai }, jamSelesai: { lte: jamSelesai } },
  ];
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createJadwal(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    hari:          formData.get("hari") as string,
    kodeMapel:     formData.get("kodeMapel") as string,
    jamMulai:      formData.get("jamMulai") as string,
    jamSelesai:    formData.get("jamSelesai") as string,
    guruId:        formData.get("guruId") as string,
    kelasId:       Number(formData.get("kelasId")),
    tahunAjaranId: Number(formData.get("tahunAjaranId")),
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  const { hari, kodeMapel, jamMulai, jamSelesai, guruId, kelasId, tahunAjaranId } = parsed.data;

  // ── Guard 1: bentrok jadwal KELAS ────────────────────────────────────────
  const bentrokKelas = await prisma.jadwal.findFirst({
    where: {
      kelasId,
      hari: hari as any,
      tahunAjaranId,
      OR: overlapCondition(jamMulai, jamSelesai),
    },
    include: { kelas: { select: { nama: true } } },
  });
  if (bentrokKelas)
    return {
      success: false,
      message: `Kelas ${bentrokKelas.kelas.nama} sudah memiliki jadwal pada hari ${hari} jam ${bentrokKelas.jamMulai}-${bentrokKelas.jamSelesai}`,
    };

  // ── Guard 2: bentrok jadwal GURU ─────────────────────────────────────────
  const bentrokGuru = await prisma.jadwal.findFirst({
    where: {
      guruId,
      hari: hari as any,
      tahunAjaranId,
      OR: overlapCondition(jamMulai, jamSelesai),
    },
    include: {
      guru: { include: { user: { select: { name: true } } } },
      kelas: { select: { nama: true } },
    },
  });
  if (bentrokGuru)
    return {
      success: false,
      message: `Guru ${bentrokGuru.guru.user.name} sudah mengajar kelas ${bentrokGuru.kelas.nama} pada hari ${hari} jam ${bentrokGuru.jamMulai}-${bentrokGuru.jamSelesai}`,
    };

  // ── Warning: guru tidak terdaftar di mapel ini ───────────────────────────
  const guruMapelExists = await prisma.guruMapel.findFirst({
    where: { idGuru: guruId, kodeMapel },
  });
  const warning = !guruMapelExists
    ? "Perhatian: Guru ini belum terdaftar sebagai pengampu mata pelajaran ini."
    : undefined;

  await prisma.jadwal.create({
    data: {
      hari: hari as any,
      kodeMapel,
      jamMulai,
      jamSelesai,
      guruId,
      kelasId,
      tahunAjaranId,
      // field mapel (string) diambil dari namaMapel
      mapel: (await prisma.mataPelajaran.findUnique({
        where: { kodeMapel },
        select: { namaMapel: true },
      }))?.namaMapel ?? kodeMapel,
    },
  });

  revalidatePath("/admin/jadwal");
  return {
    success: true,
    message: "Jadwal berhasil ditambahkan",
    warning,
  };
}

// ─── READ ALL ─────────────────────────────────────────────────────────────────
export async function getAllJadwal(params?: {
  kelasId?: number;
  guruId?: string;
  hari?: string;
  tahunAjaranId?: number;
  page?: number;
  limit?: number;
}) {
  const page  = params?.page  ?? 1;
  const limit = params?.limit ?? 20;
  const skip  = (page - 1) * limit;

  // Default ke tahun ajaran aktif jika tidak dispesifikasi
  let tahunAjaranId = params?.tahunAjaranId;
  if (!tahunAjaranId) {
    const aktif = await prisma.tahunAjaran.findFirst({ where: { aktif: true } });
    tahunAjaranId = aktif?.id;
  }

  const where: any = {
    ...(params?.kelasId      && { kelasId:       params.kelasId }),
    ...(params?.guruId       && { guruId:         params.guruId }),
    ...(params?.hari         && { hari:           params.hari as any }),
    ...(tahunAjaranId        && { tahunAjaranId }),
  };

  const [data, total] = await Promise.all([
    prisma.jadwal.findMany({
      where, skip, take: limit,
      include: {
        kelas:          { select: { nama: true, tingkat: true } },
        guru:           { include: { user: { select: { name: true } } } },
        mataPelajaran:  { select: { namaMapel: true } },
        tahunAjaran:    { select: { nama: true, semester: true } },
      },
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    }),
    prisma.jadwal.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / limit), page };
}

// ─── READ BY KELAS ────────────────────────────────────────────────────────────
export async function getJadwalByKelas(kelasId: number, tahunAjaranId?: number) {
  let taId = tahunAjaranId;
  if (!taId) {
    const aktif = await prisma.tahunAjaran.findFirst({ where: { aktif: true } });
    taId = aktif?.id;
  }

  return prisma.jadwal.findMany({
    where: { kelasId, ...(taId && { tahunAjaranId: taId }) },
    include: {
      guru:          { include: { user: { select: { name: true } } } },
      mataPelajaran: { select: { namaMapel: true } },
      tahunAjaran:   { select: { nama: true, semester: true } },
    },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
  });
}

// ─── READ BY GURU ─────────────────────────────────────────────────────────────
export async function getJadwalByGuru(guruId: string, tahunAjaranId?: number) {
  let taId = tahunAjaranId;
  if (!taId) {
    const aktif = await prisma.tahunAjaran.findFirst({ where: { aktif: true } });
    taId = aktif?.id;
  }

  return prisma.jadwal.findMany({
    where: { guruId, ...(taId && { tahunAjaranId: taId }) },
    include: {
      kelas:         { select: { nama: true, tingkat: true } },
      mataPelajaran: { select: { namaMapel: true } },
      tahunAjaran:   { select: { nama: true, semester: true } },
    },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
  });
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateJadwal(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    hari:          formData.get("hari") as string,
    kodeMapel:     formData.get("kodeMapel") as string,
    jamMulai:      formData.get("jamMulai") as string,
    jamSelesai:    formData.get("jamSelesai") as string,
    guruId:        formData.get("guruId") as string,
    kelasId:       Number(formData.get("kelasId")),
    tahunAjaranId: Number(formData.get("tahunAjaranId")),
  };

  const parsed = jadwalSchema.safeParse(raw);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  const { hari, kodeMapel, jamMulai, jamSelesai, guruId, kelasId, tahunAjaranId } = parsed.data;

  // ── Cek jadwal saat ini (untuk validasi perubahan hari/jam/kelas) ─────────
  const current = await prisma.jadwal.findUnique({ where: { id } });
  if (!current) return { success: false, message: "Jadwal tidak ditemukan" };

  const hariChanged   = current.hari !== hari;
  const jamChanged    = current.jamMulai !== jamMulai || current.jamSelesai !== jamSelesai;
  const kelasChanged  = current.kelasId !== kelasId;

  if (hariChanged || jamChanged || kelasChanged) {
    const absensiCount = await prisma.absensi.count({ where: { jadwalId: id } });
    if (absensiCount > 0)
      return {
        success: false,
        message: `Jadwal sudah memiliki ${absensiCount} data absensi, tidak dapat mengubah hari/waktu/kelas`,
      };
  }

  // ── Guard: bentrok KELAS (exclude diri sendiri) ───────────────────────────
  const bentrokKelas = await prisma.jadwal.findFirst({
    where: {
      kelasId,
      hari: hari as any,
      tahunAjaranId,
      NOT: { id },
      OR: overlapCondition(jamMulai, jamSelesai),
    },
    include: { kelas: { select: { nama: true } } },
  });
  if (bentrokKelas)
    return {
      success: false,
      message: `Kelas ${bentrokKelas.kelas.nama} sudah memiliki jadwal pada hari ${hari} jam ${bentrokKelas.jamMulai}-${bentrokKelas.jamSelesai}`,
    };

  // ── Guard: bentrok GURU (exclude diri sendiri) ────────────────────────────
  const bentrokGuru = await prisma.jadwal.findFirst({
    where: {
      guruId,
      hari: hari as any,
      tahunAjaranId,
      NOT: { id },
      OR: overlapCondition(jamMulai, jamSelesai),
    },
    include: {
      guru:  { include: { user: { select: { name: true } } } },
      kelas: { select: { nama: true } },
    },
  });
  if (bentrokGuru)
    return {
      success: false,
      message: `Guru ${bentrokGuru.guru.user.name} sudah mengajar kelas ${bentrokGuru.kelas.nama} pada hari ${hari} jam ${bentrokGuru.jamMulai}-${bentrokGuru.jamSelesai}`,
    };

  // ── Warning: guru belum terdaftar di mapel ────────────────────────────────
  const guruMapelExists = await prisma.guruMapel.findFirst({
    where: { idGuru: guruId, kodeMapel },
  });
  const warning = !guruMapelExists
    ? "Perhatian: Guru ini belum terdaftar sebagai pengampu mata pelajaran ini."
    : undefined;

  const namaMapel = (await prisma.mataPelajaran.findUnique({
    where: { kodeMapel },
    select: { namaMapel: true },
  }))?.namaMapel ?? kodeMapel;

  await prisma.jadwal.update({
    where: { id },
    data: {
      hari: hari as any,
      kodeMapel,
      mapel: namaMapel,
      jamMulai,
      jamSelesai,
      guruId,
      kelasId,
      tahunAjaranId,
    },
  });

  revalidatePath("/admin/jadwal");
  return {
    success: true,
    message: "Jadwal berhasil diperbarui",
    warning,
  };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteJadwal(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const absensiCount = await prisma.absensi.count({ where: { jadwalId: id } });
  if (absensiCount > 0)
    return {
      success: false,
      message: `Jadwal tidak bisa dihapus karena sudah memiliki ${absensiCount} data absensi`,
    };

  await prisma.jadwal.delete({ where: { id } });
  revalidatePath("/admin/jadwal");
  return { success: true, message: "Jadwal berhasil dihapus" };
}

// ─── GET DATA UNTUK DROPDOWN FORM ────────────────────────────────────────────
export async function getDataForJadwalForm() {
  const [kelas, guru, mapel, tahunAjaran] = await Promise.all([
    prisma.kelas.findMany({
      include: { tahunAjaran: { select: { nama: true, semester: true } } },
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
    }),
    prisma.guru.findMany({
      include: { user: { select: { name: true, status: true } } },
      where: { user: { status: true } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.mataPelajaran.findMany({ orderBy: { namaMapel: "asc" } }),
    prisma.tahunAjaran.findMany({
      orderBy: [{ nama: "desc" }, { semester: "asc" }],
    }),
  ]);

  return { kelas, guru, mapel, tahunAjaran };
}

// ─── GET JADWAL BY ID ─────────────────────────────────────────────────────────
export async function getJadwalById(id: number) {
  return prisma.jadwal.findUnique({
    where: { id },
    include: {
      kelas:         { select: { nama: true, tingkat: true } },
      guru:          { include: { user: { select: { name: true } } } },
      mataPelajaran: { select: { namaMapel: true } },
      tahunAjaran:   { select: { nama: true, semester: true } },
      _count:        { select: { absensi: true } },
    },
  });
}
// ─── GET GURU BY MAPEL ────────────────────────────────────────────────────────
export async function getGuruByMapel(kodeMapel: string) {
  return prisma.guruMapel.findMany({
    where: { kodeMapel },
    include: {
      guru: {
        include: { user: { select: { name: true, status: true } } },
      },
    },
  });
}