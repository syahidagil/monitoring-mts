"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sikapSchema } from "@/lib/validations/guru/sikap.validation";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

export async function createSikap(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const raw = {
    siswaId:   Number(formData.get("siswaId")),
    aspek:     (formData.get("aspek") as string)?.trim(),
    predikat:  formData.get("predikat") as string,
    deskripsi: (formData.get("deskripsi") as string)?.trim() || undefined,
    semester:  formData.get("semester") as string,
    tahunAjar: formData.get("tahunAjar") as string,
  };

  const parsed = sikapSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: parsed.error.errors[0].message };

  await prisma.sikap.create({ data: parsed.data as any });
  revalidatePath("/guru/sikap");
  return { success: true, message: "Catatan sikap berhasil disimpan" };
}

export async function getAllSikapByGuru(params?: {
  search?: string; semester?: string; tahunAjar?: string; kelasId?: number;
}) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  // Ambil kelas yang diajar guru
  const jadwalGuru = await prisma.jadwal.findMany({
    where: { guruId },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwalGuru.map((j) => j.kelasId);

  return prisma.sikap.findMany({
    where: {
      siswa: {
        kelasId: params?.kelasId
          ? params.kelasId
          : { in: kelasIds },
        ...(params?.search && {
          OR: [
            { nama: { contains: params.search } },
            { nis:  { contains: params.search } },
          ],
        }),
      },
      ...(params?.semester  && { semester:  params.semester  as any }),
      ...(params?.tahunAjar && { tahunAjar: params.tahunAjar }),
    },
    include: {
      siswa: {
        select: { id: true, nis: true, nama: true, kelas: { select: { nama: true } } },
      },
    },
    orderBy: { tanggal: "desc" },
  });
}

export async function deleteSikap(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };
  await prisma.sikap.delete({ where: { id } });
  revalidatePath("/guru/sikap");
  return { success: true, message: "Catatan sikap berhasil dihapus" };
}