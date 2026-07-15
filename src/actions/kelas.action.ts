"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { KelasSchema } from "@/lib/validations/kelas.validation";

export async function createKelas(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: formData.get("nama") as string,
    tingkat: Number(formData.get("tingkat")),
    tahunAjaranId: Number(formData.get("tahunAjaranId")),
    waliKelasId: formData.get("waliKelasId") as string || undefined,
  };

  const parsed = KelasSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.kelas.findFirst({
    where: { nama: raw.nama, tahunAjaranId: raw.tahunAjaranId },
  });
  if (exists) return { success: false, message: "Kelas dengan nama tersebut sudah ada di tahun ajaran ini" };

  await prisma.kelas.create({
    data: { ...parsed.data, waliKelasId: parsed.data.waliKelasId || null },
  });

  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil ditambahkan" };
}

export async function updateKelas(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nama: formData.get("nama") as string,
    tingkat: Number(formData.get("tingkat")),
    tahunAjaranId: Number(formData.get("tahunAjaranId")),
    waliKelasId: formData.get("waliKelasId") as string || undefined,
  };

  const parsed = KelasSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  await prisma.kelas.update({
    where: { id },
    data: { ...parsed.data, waliKelasId: parsed.data.waliKelasId || null },
  });

  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil diperbarui" };
}

export async function deleteKelas(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const siswaCount = await prisma.siswa.count({ where: { kelasId: id } });
  if (siswaCount > 0) return { success: false, message: `Kelas masih memiliki ${siswaCount} siswa, pindahkan siswa terlebih dahulu` };

  await prisma.kelas.delete({ where: { id } });
  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil dihapus" };
}