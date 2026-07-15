"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MapelSchema } from "@/lib/validations/mapel.validation";

export async function createMapel(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const raw = {
    kodeMapel: (formData.get("kodeMapel") as string).toUpperCase(),
    namaMapel: formData.get("namaMapel") as string,
  };

  const parsed = MapelSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.mataPelajaran.findUnique({ where: { kodeMapel: raw.kodeMapel } });
  if (exists) return { success: false, message: "Kode mapel sudah digunakan" };

  await prisma.mataPelajaran.create({ data: parsed.data });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil ditambahkan" };
}

export async function updateMapel(kodeMapel: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const namaMapel = formData.get("namaMapel") as string;
  if (!namaMapel) return { success: false, message: "Nama mapel wajib diisi" };

  await prisma.mataPelajaran.update({ where: { kodeMapel }, data: { namaMapel } });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil diperbarui" };
}

export async function deleteMapel(kodeMapel: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  await prisma.mataPelajaran.delete({ where: { kodeMapel } });
  revalidatePath("/admin/mata-pelajaran");
  return { success: true, message: "Mata pelajaran berhasil dihapus" };
}