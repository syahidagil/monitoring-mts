"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["ADMIN", "GURU", "ORANGTUA"]),
  status: z.boolean().default(true),
});

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  const raw = {
    username: formData.get("username") as string,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as "ADMIN" | "GURU" | "ORANGTUA",
    status: true,
  };
  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0].message };
  }
  const exists = await prisma.user.findUnique({ where: { username: raw.username } });
  if (exists) return { success: false, message: "Username sudah digunakan" };
  const hashed = await bcrypt.hash(raw.password!, 12);
  await prisma.user.create({
    data: { username: raw.username, name: raw.name, password: hashed, role: raw.role, status: true },
  });
  revalidatePath("/admin/pengguna");
  return { success: true, message: "Pengguna berhasil ditambahkan" };
}

export async function updateUserStatus(id: string, status: boolean) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  await prisma.user.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pengguna");
  return { success: true, message: "Status berhasil diubah" };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/pengguna");
  return { success: true, message: "Pengguna berhasil dihapus" };
}

export async function resetPassword(id: string, newPassword: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan" };
  }
  if (newPassword.length < 6) return { success: false, message: "Password minimal 6 karakter" };
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return { success: true, message: "Password berhasil direset" };
}
