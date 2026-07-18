"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { JadwalSchema } from "@/lib/validations/jadwal.validation";

export async function createJadwal(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    kelasId: Number(formData.get("kelasId")),
    guruId: formData.get("guruId") as string,
    mapel: (formData.get("mapel") as string)?.trim(),
    hari: formData.get("hari") as string,
    jamMulai: formData.get("jamMulai") as string,
    jamSelesai: formData.get("jamSelesai") as string,
  };

  const parsed = JadwalSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.jadwal.findFirst({
    where: {
      kelasId: parsed.data.kelasId,
      hari: parsed.data.hari as any,
      OR: [
        { jamMulai: { lte: parsed.data.jamMulai }, jamSelesai: { gt: parsed.data.jamMulai } },
        { jamMulai: { lt: parsed.data.jamSelesai }, jamSelesai: { gte: parsed.data.jamSelesai } },
        { jamMulai: { gte: parsed.data.jamMulai }, jamSelesai: { lte: parsed.data.jamSelesai } },
      ],
    },
  });
  if (exists) return { success: false, message: "Jadwal bentrok dengan jadwal lain di kelas dan hari yang sama" };

  await prisma.jadwal.create({ data: parsed.data as any });
  revalidatePath("/admin/jadwal");
  return { success: true, message: "Jadwal berhasil ditambahkan" };
}

export async function getAllJadwal(params?: { kelasId?: number; guruId?: string; hari?: string }) {
  return prisma.jadwal.findMany({
    where: {
      ...(params?.kelasId && { kelasId: params.kelasId }),
      ...(params?.guruId && { guruId: params.guruId }),
      ...(params?.hari && { hari: params.hari as any }),
    },
    include: {
      kelas: { include: { tahunAjaran: { select: { nama: true } } } },
      guru: { include: { user: { select: { name: true } } } },
    },
    orderBy: [
      { hari: "asc" },
      { jamMulai: "asc" },
    ],
  });
}

export async function getJadwalById(id: number) {
  return prisma.jadwal.findUnique({
    where: { id },
    include: {
      kelas: { include: { tahunAjaran: { select: { nama: true } } } },
      guru: { include: { user: { select: { name: true } } } },
    },
  });
}

export async function updateJadwal(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const raw = {
    kelasId: Number(formData.get("kelasId")),
    guruId: formData.get("guruId") as string,
    mapel: (formData.get("mapel") as string)?.trim(),
    hari: formData.get("hari") as string,
    jamMulai: formData.get("jamMulai") as string,
    jamSelesai: formData.get("jamSelesai") as string,
  };

  const parsed = JadwalSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  const exists = await prisma.jadwal.findFirst({
    where: {
      kelasId: parsed.data.kelasId,
      hari: parsed.data.hari as any,
      NOT: { id },
      OR: [
        { jamMulai: { lte: parsed.data.jamMulai }, jamSelesai: { gt: parsed.data.jamMulai } },
        { jamMulai: { lt: parsed.data.jamSelesai }, jamSelesai: { gte: parsed.data.jamSelesai } },
        { jamMulai: { gte: parsed.data.jamMulai }, jamSelesai: { lte: parsed.data.jamSelesai } },
      ],
    },
  });
  if (exists) return { success: false, message: "Jadwal bentrok dengan jadwal lain" };

  await prisma.jadwal.update({ where: { id }, data: parsed.data as any });
  revalidatePath("/admin/jadwal");
  return { success: true, message: "Jadwal berhasil diperbarui" };
}

export async function deleteJadwal(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const absensiCount = await prisma.absensi.count({ where: { jadwalId: id } });
  if (absensiCount > 0)
    return { success: false, message: `Jadwal masih memiliki ${absensiCount} data absensi. Hapus absensi terlebih dahulu.` };

  await prisma.jadwal.delete({ where: { id } });
  revalidatePath("/admin/jadwal");
  return { success: true, message: "Jadwal berhasil dihapus" };
}