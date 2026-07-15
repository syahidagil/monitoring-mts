"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export async function createPengumuman(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }

  const judul = formData.get("judul") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const filePath = formData.get("filePath") as string;
  const fileName = formData.get("fileName") as string;
  const tahun = formData.get("tahun") as string;

  if (!judul || !filePath || !fileName || !tahun) {
    return { success: false, message: "Semua field wajib diisi" };
  }

  await prisma.pengumumanPmbm.create({
    data: {
      judul,
      deskripsi: deskripsi || null,
      filePath,
      fileName,
      tahun,
      idUser: session.user.id,
    },
  });

  revalidatePath("/pmbm/pengumuman");
  revalidatePath("/admin/pmbm");
  return { success: true, message: "Pengumuman berhasil ditambahkan" };
}

export async function deletePengumuman(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }

  const data = await prisma.pengumumanPmbm.findUnique({ where: { id } });
  if (data) {
    try {
      const fullPath = path.join(process.cwd(), "public", data.filePath);
      await unlink(fullPath);
    } catch {}
  }

  await prisma.pengumumanPmbm.delete({ where: { id } });
  revalidatePath("/pmbm/pengumuman");
  revalidatePath("/admin/pmbm");
  return { success: true, message: "Pengumuman berhasil dihapus" };
}
