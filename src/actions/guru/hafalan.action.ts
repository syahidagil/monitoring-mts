"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hafalanSchema } from "@/lib/validations/guru/hafalan.validation";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

export async function createHafalan(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const raw = {
    siswaId:     Number(formData.get("siswaId")),
    surah:       (formData.get("surah") as string)?.trim(),
    ayatMulai:   Number(formData.get("ayatMulai")),
    ayatSelesai: Number(formData.get("ayatSelesai")),
    juz:         formData.get("juz") ? Number(formData.get("juz")) : undefined,
    nilai:       formData.get("nilai") ? Number(formData.get("nilai")) : undefined,
    status:      formData.get("status") as string,
    catatan:     (formData.get("catatan") as string)?.trim() || undefined,
  };

  const parsed = hafalanSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  await prisma.hafalan.create({ data: parsed.data as any });
  revalidatePath("/guru/hafalan");
  return { success: true, message: "Data hafalan berhasil disimpan" };
}

export async function getHafalanBySiswa(siswaId: number) {
  return prisma.hafalan.findMany({
    where: { siswaId },
    orderBy: { tanggal: "desc" },
  });
}

export async function getSiswaTahfidz(guruId?: string) {
  // Ambil semua siswa statusTahfidz = true dari kelas yang diajar
  const session = await auth();
  const gId = guruId ?? session?.user?.id;
  if (!gId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId: gId },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.siswa.findMany({
    where: { statusTahfidz: true, kelasId: { in: kelasIds } },
    include: {
      kelas: { select: { nama: true } },
      hafalan: { orderBy: { tanggal: "desc" }, take: 1 },
      _count: { select: { hafalan: true } },
    },
    orderBy: { nama: "asc" },
  });
}

export async function deleteHafalan(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };
  await prisma.hafalan.delete({ where: { id } });
  revalidatePath("/guru/hafalan");
  return { success: true, message: "Data hafalan berhasil dihapus" };
}