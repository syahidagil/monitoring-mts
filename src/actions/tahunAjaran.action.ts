"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TahunAjaranSchema } from "@/lib/validations/tahunAjaran.validation";

export async function createTahunAjaran(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: (formData.get("nama") as string)?.trim(),
    semester: formData.get("semester") as string,
    aktif: formData.get("aktif") === "true",
  };

  const parsed = TahunAjaranSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.tahunAjaran.findUnique({ where: { nama: parsed.data.nama } });
  if (exists) return { success: false, message: `Tahun ajaran ${parsed.data.nama} sudah ada` };

  if (parsed.data.aktif) {
    await prisma.tahunAjaran.updateMany({ data: { aktif: false } });
  }

  const data = await prisma.tahunAjaran.create({ data: parsed.data });
  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun ajaran berhasil ditambahkan", data };
}

export async function getAllTahunAjaran() {
  return prisma.tahunAjaran.findMany({
    include: { _count: { select: { kelas: true } } },
    orderBy: { nama: "desc" },
  });
}

export async function getTahunAjaranById(id: number) {
  return prisma.tahunAjaran.findUnique({
    where: { id },
    include: { _count: { select: { kelas: true } } },
  });
}

export async function updateTahunAjaran(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: (formData.get("nama") as string)?.trim(),
    semester: formData.get("semester") as string,
    aktif: formData.get("aktif") === "true",
  };

  const parsed = TahunAjaranSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.tahunAjaran.findFirst({
    where: { nama: parsed.data.nama, NOT: { id } },
  });
  if (exists) return { success: false, message: `Tahun ajaran ${parsed.data.nama} sudah ada` };

  if (parsed.data.aktif) {
    await prisma.tahunAjaran.updateMany({ where: { NOT: { id } }, data: { aktif: false } });
  }

  await prisma.tahunAjaran.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun ajaran berhasil diperbarui" };
}

export async function setTahunAjaranAktif(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  await prisma.tahunAjaran.updateMany({ data: { aktif: false } });
  await prisma.tahunAjaran.update({ where: { id }, data: { aktif: true } });
  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun ajaran aktif berhasil diubah" };
}

export async function deleteTahunAjaran(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const ta = await prisma.tahunAjaran.findUnique({
    where: { id },
    include: { _count: { select: { kelas: true } } },
  });
  if (!ta) return { success: false, message: "Tahun ajaran tidak ditemukan" };
  if (ta.aktif) return { success: false, message: "Tidak bisa menghapus tahun ajaran yang sedang aktif" };
  if (ta._count.kelas > 0)
    return { success: false, message: `Tahun ajaran masih memiliki ${ta._count.kelas} kelas. Hapus kelas terlebih dahulu.` };

  await prisma.tahunAjaran.delete({ where: { id } });
  revalidatePath("/admin/tahun-pelajaran");
  return { success: true, message: "Tahun ajaran berhasil dihapus" };
}