"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SiswaSchema } from "@/lib/validations/siswa.validation";

export async function createSiswa(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nis: formData.get("nis") as string,
    nama: formData.get("nama") as string,
    jenisKelamin: formData.get("jenisKelamin") as "L" | "P",
    tanggalLahir: formData.get("tanggalLahir") as string,
    tempatLahir: formData.get("tempatLahir") as string || undefined,
    alamat: formData.get("alamat") as string || undefined,
    namaAyah: formData.get("namaAyah") as string || undefined,
    namaIbu: formData.get("namaIbu") as string || undefined,
    statusTahfidz: formData.get("statusTahfidz") === "true",
    kelasId: Number(formData.get("kelasId")),
    orangTuaId: formData.get("orangTuaId") as string || undefined,
    status: formData.get("status") !== "false",
  };

  const parsed = SiswaSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.siswa.findUnique({ where: { nis: raw.nis } });
  if (exists) return { success: false, message: "NIS sudah terdaftar" };

  await prisma.siswa.create({
    data: {
      ...parsed.data,
      tanggalLahir: new Date(parsed.data.tanggalLahir),
      orangTuaId: parsed.data.orangTuaId || null,
    },
  });

  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Siswa berhasil ditambahkan" };
}

export async function updateSiswa(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const raw = {
    nis: formData.get("nis") as string,
    nama: formData.get("nama") as string,
    jenisKelamin: formData.get("jenisKelamin") as "L" | "P",
    tanggalLahir: formData.get("tanggalLahir") as string,
    tempatLahir: formData.get("tempatLahir") as string || undefined,
    alamat: formData.get("alamat") as string || undefined,
    namaAyah: formData.get("namaAyah") as string || undefined,
    namaIbu: formData.get("namaIbu") as string || undefined,
    statusTahfidz: formData.get("statusTahfidz") === "true",
    kelasId: Number(formData.get("kelasId")),
    orangTuaId: formData.get("orangTuaId") as string || undefined,
    status: formData.get("status") !== "false",
  };

  const parsed = SiswaSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  await prisma.siswa.update({
    where: { id },
    data: {
      ...parsed.data,
      tanggalLahir: new Date(parsed.data.tanggalLahir),
      orangTuaId: parsed.data.orangTuaId || null,
    },
  });

  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Data siswa berhasil diperbarui" };
}

export async function deleteSiswa(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  await prisma.siswa.delete({ where: { id } });
  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Siswa berhasil dihapus" };
}