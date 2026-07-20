"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { tahsinSchema } from "@/lib/validations/guru/tahsin.validation";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

export async function createTahsin(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const raw = {
    siswaId: Number(formData.get("siswaId")),
    materi:  (formData.get("materi") as string)?.trim(),
    nilai:   formData.get("nilai") ? Number(formData.get("nilai")) : undefined,
    status:  formData.get("status") as string,
    catatan: (formData.get("catatan") as string)?.trim() || undefined,
  };

  const parsed = tahsinSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  await prisma.tahsin.create({ data: parsed.data as any });
  revalidatePath("/guru/tahsin");
  return { success: true, message: "Data tahsin berhasil disimpan" };
}

export async function getTahsinBySiswa(siswaId: number) {
  return prisma.tahsin.findMany({
    where: { siswaId },
    orderBy: { tanggal: "desc" },
  });
}

export async function getSiswaForTahsin() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId: session.user.id },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.siswa.findMany({
    where: { kelasId: { in: kelasIds }, status: true },
    include: {
      kelas: { select: { nama: true } },
      tahsin: { orderBy: { tanggal: "desc" }, take: 1 },
      _count: { select: { tahsin: true } },
    },
    orderBy: { nama: "asc" },
  });
}

export async function deleteTahsin(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };
  await prisma.tahsin.delete({ where: { id } });
  revalidatePath("/guru/tahsin");
  return { success: true, message: "Data tahsin berhasil dihapus" };
}