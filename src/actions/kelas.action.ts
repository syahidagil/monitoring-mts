"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function detectTingkat(namaKelas: string): number {
  const digit = namaKelas.match(/\d/);
  if (!digit) return 7;
  const t = parseInt(digit[0]);
  return [7, 8, 9].includes(t) ? t : 7;
}

export async function createKelas(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nama = (formData.get("nama") as string)?.trim();
  const tahunAjaranId = Number(formData.get("tahunAjaranId"));
  const waliKelasId = (formData.get("waliKelasId") as string) || null;

  if (!nama) return { success: false, message: "Nama kelas wajib diisi" };
  if (!tahunAjaranId) return { success: false, message: "Tahun ajaran wajib dipilih" };

  const tingkat = detectTingkat(nama);

  const exists = await prisma.kelas.findFirst({
    where: { nama, tahunAjaranId },
  });
  if (exists) return { success: false, message: `Kelas ${nama} sudah ada di tahun ajaran ini` };

  const data = await prisma.kelas.create({
    data: { nama, tingkat, tahunAjaranId, waliKelasId },
  });

  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil ditambahkan", data };
}

export async function getAllKelas() {
  return prisma.kelas.findMany({
    include: {
      tahunAjaran: true,
      waliKelas: { include: { user: { select: { name: true } } } },
      _count: { select: { siswa: true, jadwal: true } },
    },
    orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
  });
}

export async function getKelasById(id: number) {
  return prisma.kelas.findUnique({
    where: { id },
    include: {
      tahunAjaran: true,
      waliKelas: { include: { user: { select: { name: true } } } },
      _count: { select: { siswa: true, jadwal: true } },
    },
  });
}

export async function updateKelas(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nama = (formData.get("nama") as string)?.trim();
  const tahunAjaranId = Number(formData.get("tahunAjaranId"));
  const waliKelasId = (formData.get("waliKelasId") as string) || null;

  if (!nama) return { success: false, message: "Nama kelas wajib diisi" };
  if (!tahunAjaranId) return { success: false, message: "Tahun ajaran wajib dipilih" };

  const tingkat = detectTingkat(nama);

  const exists = await prisma.kelas.findFirst({
    where: { nama, tahunAjaranId, NOT: { id } },
  });
  if (exists) return { success: false, message: `Kelas ${nama} sudah ada di tahun ajaran ini` };

  await prisma.kelas.update({
    where: { id },
    data: { nama, tingkat, tahunAjaranId, waliKelasId },
  });

  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil diperbarui" };
}

export async function deleteKelas(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const kelas = await prisma.kelas.findUnique({
    where: { id },
    include: { _count: { select: { siswa: true, jadwal: true } } },
  });
  if (!kelas) return { success: false, message: "Kelas tidak ditemukan" };
  if (kelas._count.siswa > 0)
    return { success: false, message: `Kelas masih memiliki ${kelas._count.siswa} siswa. Pindahkan siswa terlebih dahulu.` };
  if (kelas._count.jadwal > 0)
    return { success: false, message: `Kelas masih memiliki ${kelas._count.jadwal} jadwal pelajaran. Hapus jadwal terlebih dahulu.` };

  await prisma.kelas.delete({ where: { id } });
  revalidatePath("/admin/data-kelas");
  return { success: true, message: "Kelas berhasil dihapus" };
}

export async function getTahunAjaranAktif() {
  return prisma.tahunAjaran.findFirst({ where: { aktif: true } });
}

export async function getAllTahunAjaran() {
  return prisma.tahunAjaran.findMany({ orderBy: { nama: "desc" } });
}