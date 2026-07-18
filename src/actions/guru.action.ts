"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createGuru(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const nama = (formData.get("nama") as string)?.trim();
  const nip = (formData.get("nip") as string)?.trim() || null;
  const mapel = (formData.get("mapel") as string)?.trim();
  const noHp = (formData.get("noHp") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const pendidikan = (formData.get("pendidikan") as string)?.trim() || null;
  const status = formData.get("status") !== "false";

  if (!username) return { success: false, message: "Username wajib diisi" };
  if (!password || password.length < 6) return { success: false, message: "Password minimal 6 karakter" };
  if (!nama) return { success: false, message: "Nama wajib diisi" };
  if (!mapel) return { success: false, message: "Mata pelajaran wajib diisi" };

  const userExists = await prisma.user.findUnique({ where: { username } });
  if (userExists) return { success: false, message: "Username sudah digunakan" };

  if (nip) {
    const nipExists = await prisma.guru.findUnique({ where: { nip } });
    if (nipExists) return { success: false, message: "NIP sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username, password: hashedPassword, name: nama, role: "GURU", status },
    });
    await tx.guru.create({
      data: { id: user.id, nip, mapel, noHp, alamat, pendidikan },
    });
  });

  revalidatePath("/admin/data-guru");
  return { success: true, message: "Guru berhasil ditambahkan" };
}

export async function getAllGuru() {
  return prisma.guru.findMany({
    include: {
      user: { select: { username: true, status: true, name: true, createdAt: true } },
      guruMapel: { include: { mataPelajaran: true } },
      kelasWali: { select: { id: true, nama: true } },
      _count: { select: { jadwal: true, nilaiList: true, absensiList: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getGuruById(id: string) {
  return prisma.guru.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, status: true, name: true, createdAt: true } },
      guruMapel: { include: { mataPelajaran: true } },
      kelasWali: { select: { id: true, nama: true } },
      _count: { select: { jadwal: true, nilaiList: true, absensiList: true } },
    },
  });
}

export async function updateGuru(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nama = (formData.get("nama") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const nip = (formData.get("nip") as string)?.trim() || null;
  const mapel = (formData.get("mapel") as string)?.trim();
  const noHp = (formData.get("noHp") as string)?.trim() || null;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const pendidikan = (formData.get("pendidikan") as string)?.trim() || null;
  const status = formData.get("status") !== "false";

  if (!nama) return { success: false, message: "Nama wajib diisi" };
  if (!mapel) return { success: false, message: "Mata pelajaran wajib diisi" };

  const currentUser = await prisma.user.findUnique({ where: { id } });
  if (!currentUser) return { success: false, message: "Guru tidak ditemukan" };

  if (username && username !== currentUser.username) {
    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) return { success: false, message: "Username sudah digunakan" };
  }

  if (nip) {
    const nipExists = await prisma.guru.findFirst({ where: { nip, NOT: { id } } });
    if (nipExists) return { success: false, message: "NIP sudah terdaftar guru lain" };
  }

  await prisma.$transaction(async (tx) => {
    const userUpdate: any = { name: nama, status };
    if (username) userUpdate.username = username;
    if (password && password.length >= 6) {
      userUpdate.password = await bcrypt.hash(password, 12);
    }
    await tx.user.update({ where: { id }, data: userUpdate });
    await tx.guru.update({ where: { id }, data: { nip, mapel, noHp, alamat, pendidikan } });
  });

  revalidatePath("/admin/data-guru");
  return { success: true, message: "Data guru berhasil diperbarui" };
}

export async function deleteGuru(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const guru = await prisma.guru.findUnique({
    where: { id },
    include: {
      _count: { select: { jadwal: true, nilaiList: true, absensiList: true, kelasWali: true } },
    },
  });
  if (!guru) return { success: false, message: "Guru tidak ditemukan" };
  if (guru._count.jadwal > 0)
    return { success: false, message: "Guru masih memiliki jadwal mengajar. Hapus jadwal terlebih dahulu." };
  if (guru._count.nilaiList > 0)
    return { success: false, message: "Guru masih memiliki data nilai siswa." };
  if (guru._count.absensiList > 0)
    return { success: false, message: "Guru masih memiliki data absensi siswa." };
  if (guru._count.kelasWali > 0)
    return { success: false, message: "Guru masih menjadi wali kelas. Ganti wali kelas terlebih dahulu." };

  await prisma.$transaction(async (tx) => {
    await tx.guruMapel.deleteMany({ where: { idGuru: id } });
    await tx.guru.delete({ where: { id } });
    await tx.user.delete({ where: { id } });
  });

  revalidatePath("/admin/data-guru");
  return { success: true, message: "Guru berhasil dihapus" };
}

export async function resetPasswordGuru(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const hashed = await bcrypt.hash("password123", 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return { success: true, message: "Password direset ke: password123" };
}