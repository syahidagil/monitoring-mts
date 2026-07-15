"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createGuru(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const username = formData.get("username") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const nip = formData.get("nip") as string || undefined;
  const mapel = formData.get("mapel") as string;
  const noHp = formData.get("noHp") as string || undefined;
  const alamat = formData.get("alamat") as string || undefined;
  const pendidikan = formData.get("pendidikan") as string || undefined;

  if (!username || !name || !password || !mapel) return { success: false, message: "Username, nama, password, dan mapel wajib diisi" };

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { success: false, message: "Username sudah digunakan" };

  if (nip) {
    const nipExists = await prisma.guru.findUnique({ where: { nip } });
    if (nipExists) return { success: false, message: "NIP sudah terdaftar" };
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, name, password: hashed, role: "GURU", status: true },
  });

  await prisma.guru.create({
    data: { id: user.id, nip, mapel, noHp, alamat, pendidikan },
  });

  revalidatePath("/admin/data-guru");
  return { success: true, message: "Guru berhasil ditambahkan" };
}

export async function updateGuru(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const name = formData.get("name") as string;
  const nip = formData.get("nip") as string || undefined;
  const mapel = formData.get("mapel") as string;
  const noHp = formData.get("noHp") as string || undefined;
  const alamat = formData.get("alamat") as string || undefined;
  const pendidikan = formData.get("pendidikan") as string || undefined;
  const password = formData.get("password") as string;
  const status = formData.get("status") !== "false";

  await prisma.user.update({ where: { id }, data: { name, status } });
  await prisma.guru.update({ where: { id }, data: { nip, mapel, noHp, alamat, pendidikan } });

  if (password && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
  }

  revalidatePath("/admin/data-guru");
  return { success: true, message: "Data guru berhasil diperbarui" };
}

export async function deleteGuru(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  await prisma.guru.delete({ where: { id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/data-guru");
  return { success: true, message: "Guru berhasil dihapus" };
}