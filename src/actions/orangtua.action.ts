"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createOrangTua(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nama = (formData.get("nama") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const noHp = (formData.get("noHp") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const pekerjaan = (formData.get("pekerjaan") as string)?.trim() || null;
  const status = formData.get("status") !== "false";
  const siswaIdsRaw = formData.get("siswaIds") as string;
  const siswaIds: number[] = siswaIdsRaw
    ? siswaIdsRaw.split(",").map(Number).filter(Boolean)
    : [];

  if (!nama) return { success: false, message: "Nama wajib diisi" };
  if (!username) return { success: false, message: "Username wajib diisi" };
  if (!password || password.length < 6) return { success: false, message: "Password minimal 6 karakter" };
  if (siswaIds.length === 0) return { success: false, message: "Silakan pilih setidaknya satu siswa." };

  const userExists = await prisma.user.findUnique({ where: { username } });
  if (userExists) return { success: false, message: "Username sudah digunakan" };

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username, password: hashedPassword, name: nama, role: "ORANGTUA", status },
    });
    await tx.orangTua.create({
      data: { id: user.id, noHp, alamat, pekerjaan },
    });
    if (siswaIds.length > 0) {
      await tx.siswa.updateMany({
        where: { id: { in: siswaIds } },
        data: { orangTuaId: user.id },
      });
    }
  });

  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Orang tua berhasil ditambahkan" };
}

export async function getAllOrangTua() {
  return prisma.orangTua.findMany({
    include: {
      user: { select: { username: true, name: true, status: true, createdAt: true } },
      anak: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
      _count: { select: { anak: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getOrangTuaById(id: string) {
  return prisma.orangTua.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, name: true, status: true, createdAt: true } },
      anak: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
      _count: { select: { anak: true } },
    },
  });
}

export async function updateOrangTua(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nama = (formData.get("nama") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const noHp = (formData.get("noHp") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const pekerjaan = (formData.get("pekerjaan") as string)?.trim() || null;
  const status = formData.get("status") !== "false";
  const siswaIdsRaw = formData.get("siswaIds") as string;
  const newSiswaIds: number[] = siswaIdsRaw
    ? siswaIdsRaw.split(",").map(Number).filter(Boolean)
    : [];

  if (!nama) return { success: false, message: "Nama wajib diisi" };

  const currentUser = await prisma.user.findUnique({ where: { id } });
  if (!currentUser) return { success: false, message: "Data orang tua tidak ditemukan" };

  if (username && username !== currentUser.username) {
    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) return { success: false, message: "Username sudah digunakan" };
  }

  await prisma.$transaction(async (tx) => {
    const userUpdate: any = { name: nama, status };
    if (username) userUpdate.username = username;
    if (password && password.length >= 6) {
      userUpdate.password = await bcrypt.hash(password, 12);
    }
    await tx.user.update({ where: { id }, data: userUpdate });
    await tx.orangTua.update({ where: { id }, data: { noHp, alamat, pekerjaan } });

    // Lepas semua relasi anak lama
    await tx.siswa.updateMany({
      where: { orangTuaId: id },
      data: { orangTuaId: null },
    });
    // Set relasi anak baru
    if (newSiswaIds.length > 0) {
      await tx.siswa.updateMany({
        where: { id: { in: newSiswaIds } },
        data: { orangTuaId: id },
      });
    }
  });

  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Data orang tua berhasil diperbarui" };
}

export async function deleteOrangTua(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const ortu = await prisma.orangTua.findUnique({ where: { id } });
  if (!ortu) return { success: false, message: "Data orang tua tidak ditemukan" };

  await prisma.$transaction(async (tx) => {
    // Lepas semua relasi anak
    await tx.siswa.updateMany({
      where: { orangTuaId: id },
      data: { orangTuaId: null },
    });
    await tx.orangTua.delete({ where: { id } });
    await tx.user.delete({ where: { id } });
  });

  revalidatePath("/admin/data-orangtua");
  return { success: true, message: "Orang tua berhasil dihapus" };
}