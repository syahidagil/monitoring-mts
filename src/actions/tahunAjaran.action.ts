"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { tahunAjaranSchema } from "@/lib/validations/tahunAjaran.validation";

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createTahunPelajaran(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: (formData.get("nama") as string)?.trim(),
    semester: formData.get("semester") as string,
  };

  const parsed = tahunAjaranSchema.safeParse(raw);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  // Cek duplikat kombinasi nama + semester
  const exists = await prisma.tahunAjaran.findFirst({
    where: { nama: parsed.data.nama, semester: parsed.data.semester as any },
  });
  if (exists)
    return {
      success: false,
      message: `Tahun pelajaran ${parsed.data.nama} Semester ${parsed.data.semester} sudah ada`,
    };

  // Cek apakah ini data pertama → otomatis aktif
  const count = await prisma.tahunAjaran.count();
  const aktif = count === 0;

  await prisma.tahunAjaran.create({
    data: {
      nama: parsed.data.nama,
      semester: parsed.data.semester as any,
      aktif,
    },
  });

  revalidatePath("/admin/tahun-pelajaran");
  return {
    success: true,
    message: aktif
      ? "Tahun pelajaran berhasil ditambahkan dan otomatis diaktifkan"
      : "Tahun pelajaran berhasil ditambahkan",
  };
}

// ─── READ ALL ─────────────────────────────────────────────────────────────────
export async function getAllTahunPelajaran() {
  return prisma.tahunAjaran.findMany({
    include: {
      _count: { select: { kelas: true } },
    },
    orderBy: { nama: "desc" },
  });
}

// ─── READ ONE ─────────────────────────────────────────────────────────────────
export async function getTahunPelajaranById(id: number) {
  return prisma.tahunAjaran.findUnique({
    where: { id },
    include: {
      _count: { select: { kelas: true } },
    },
  });
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateTahunPelajaran(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: (formData.get("nama") as string)?.trim(),
    semester: formData.get("semester") as string,
  };

  const parsed = tahunAjaranSchema.safeParse(raw);
  if (!parsed.success)
    return { success: false, message: parsed.error.errors[0].message };

  // Cek apakah sudah punya jadwal (lewat kelas)
  const kelasCount = await prisma.kelas.count({ where: { tahunAjaranId: id } });
  if (kelasCount > 0) {
    const jadwalCount = await prisma.jadwal.count({
      where: { kelas: { tahunAjaranId: id } },
    });
    if (jadwalCount > 0)
      return {
        success: false,
        message: `Tahun pelajaran sudah memiliki ${jadwalCount} jadwal, tidak dapat diubah`,
      };
  }

  // Cek duplikat kecuali diri sendiri
  const exists = await prisma.tahunAjaran.findFirst({
    where: {
      nama: parsed.data.nama,
      semester: parsed.data.semester as any,
      NOT: { id },
    },
  });
  if (exists)
    return {
      success: false,
      message: `Tahun pelajaran ${parsed.data.nama} Semester ${parsed.data.semester} sudah ada`,
    };

  await prisma.tahunAjaran.update({
    where: { id },
    data: {
      nama: parsed.data.nama,
      semester: parsed.data.semester as any,
    },
  });

  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun pelajaran berhasil diperbarui" };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteTahunPelajaran(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const ta = await prisma.tahunAjaran.findUnique({
    where: { id },
    include: {
      _count: { select: { kelas: true } },
    },
  });
  if (!ta) return { success: false, message: "Tahun pelajaran tidak ditemukan" };

  // Guard 1: sedang aktif
  if (ta.aktif)
    return {
      success: false,
      message:
        "Tidak bisa menghapus tahun pelajaran yang sedang aktif. Nonaktifkan terlebih dahulu.",
    };

  // Guard 2: punya jadwal
  const jadwalCount = await prisma.jadwal.count({
    where: { kelas: { tahunAjaranId: id } },
  });
  if (jadwalCount > 0)
    return {
      success: false,
      message: `Tidak bisa menghapus karena masih memiliki ${jadwalCount} jadwal.`,
    };

  // Guard 3: punya kelas
  if (ta._count.kelas > 0)
    return {
      success: false,
      message: `Tidak bisa menghapus karena masih digunakan oleh ${ta._count.kelas} kelas.`,
    };

  await prisma.tahunAjaran.delete({ where: { id } });
  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun pelajaran berhasil dihapus" };
}

// ─── SET AKTIF ────────────────────────────────────────────────────────────────
export async function setTahunPelajaranAktif(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const ta = await prisma.tahunAjaran.findUnique({ where: { id } });
  if (!ta) return { success: false, message: "Tahun pelajaran tidak ditemukan" };
  if (ta.aktif) return { success: false, message: "Tahun pelajaran ini sudah aktif" };

  await prisma.$transaction([
    prisma.tahunAjaran.updateMany({ data: { aktif: false } }),
    prisma.tahunAjaran.update({ where: { id }, data: { aktif: true } }),
  ]);

  revalidatePath("/admin/tahun-pelajaran");
  revalidatePath("/admin/jadwal");
  return { success: true, message: "Tahun pelajaran berhasil diaktifkan" };
}

// ─── GET AKTIF ────────────────────────────────────────────────────────────────
export async function getTahunPelajaranAktif() {
  return prisma.tahunAjaran.findFirst({ where: { aktif: true } });
}