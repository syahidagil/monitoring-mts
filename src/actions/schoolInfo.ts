"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SchoolInfoSchema = z.object({
  kategori: z.string().min(1),
  judul: z.string().min(1, "Judul wajib diisi").max(100),
  isi: z.string().min(1, "Isi konten wajib diisi"),
  gambar: z.string().optional(),
});

export async function upsertSchoolInfo(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  const raw = {
    kategori: formData.get("kategori") as string,
    judul: formData.get("judul") as string,
    isi: formData.get("isi") as string,
    gambar: formData.get("gambar") as string || undefined,
  };
  const parsed = SchoolInfoSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message };
  }
  const idInfo = formData.get("idInfo");
  if (idInfo) {
    await prisma.informasiSekolah.update({
      where: { idInfo: Number(idInfo) },
      data: { ...parsed.data, kategori: parsed.data.kategori as any },
    });
  } else {
    await prisma.informasiSekolah.create({
      data: { ...parsed.data, kategori: parsed.data.kategori as any, idUser: session.user.id },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/informasi");
  return { success: true, message: "Berhasil disimpan" };
}

export async function deleteSchoolInfo(idInfo: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  await prisma.informasiSekolah.delete({ where: { idInfo } });
  revalidatePath("/");
  return { success: true, message: "Berhasil dihapus" };
}
