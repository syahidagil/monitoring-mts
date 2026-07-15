"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createOrangtua(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const username = formData.get("username") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const noHp = formData.get("noHp") as string || undefined;
  const alamat = formData.get("alamat") as string || undefined;
  const pekerjaan = formData.get("pekerjaan") as string || undefined;

  if (!username || !name || !password) return { success: false, message: "Username, nama, dan password wajib diisi" };
  if (password.length < 6) return { success: false, message: "Password minimal 6 karakter" };

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { success: false, message: "Username sudah digunakan" };

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, name, password: hashed, role: "ORANGTUA", status: true },
  });

  await prisma.orangTua.create({
    data: { id: user.id, noHp, alamat, pekerjaan },
  });

  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Orang tua berhasil ditambahkan" };
}

export async function updateOrangtua(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  const name = formData.get("name") as string;
  const noHp = formData.get("noHp") as string || undefined;
  const alamat = formData.get("alamat") as string || undefined;
  const pekerjaan = formData.get("pekerjaan") as string || undefined;
  const password = formData.get("password") as string;
  const status = formData.get("status") !== "false";

  await prisma.user.update({ where: { id }, data: { name, status } });
  await prisma.orangTua.update({ where: { id }, data: { noHp, alamat, pekerjaan } });

  if (password && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
  }

  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Data orang tua berhasil diperbarui" };
}

export async function deleteOrangtua(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Tidak diizinkan" };

  await prisma.orangTua.delete({ where: { id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Orang tua berhasil dihapus" };
}