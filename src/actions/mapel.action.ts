"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMapel(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const kodeMapel = (formData.get("kodeMapel") as string)?.trim().toUpperCase();
  const namaMapel = (formData.get("namaMapel") as string)?.trim();

  if (!kodeMapel) return { success: false, message: "Kode mapel wajib diisi" };
  if (kodeMapel.length > 5) return { success: false, message: "Kode mapel maksimal 5 karakter" };
  if (!namaMapel) return { success: false, message: "Nama mapel wajib diisi" };

  const kodeExists = await prisma.mataPelajaran.findUnique({ where: { kodeMapel } });
  if (kodeExists) return { success: false, message: `Kode mapel ${kodeMapel} sudah digunakan` };

  const namaExists = await prisma.mataPelajaran.findFirst({
    where: { namaMapel: { equals: namaMapel, mode: "insensitive" } },
  });
  if (namaExists) return { success: false, message: `Mata pelajaran "${namaMapel}" sudah terdaftar` };

  await prisma.mataPelajaran.create({ data: { kodeMapel, namaMapel } });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil ditambahkan" };
}

export async function getAllMapel() {
  return prisma.mataPelajaran.findMany({
    include: { _count: { select: { guruMapel: true } } },
    orderBy: { namaMapel: "asc" },
  });
}

export async function updateMapel(kodeMapel: string, namaMapel: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  if (!namaMapel?.trim()) return { success: false, message: "Nama mapel wajib diisi" };

  await prisma.mataPelajaran.update({
    where: { kodeMapel },
    data: { namaMapel: namaMapel.trim() },
  });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil diperbarui" };
}

export async function deleteMapel(kodeMapel: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const count = await prisma.guruMapel.count({ where: { kodeMapel } });
  if (count > 0)
    return { success: false, message: `Mata pelajaran ini masih digunakan oleh ${count} guru. Lepaskan relasi terlebih dahulu.` };

  await prisma.mataPelajaran.delete({ where: { kodeMapel } });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil dihapus" };
}