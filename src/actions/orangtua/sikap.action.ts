"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getSikapAnak(params?: {
  anakId?: number;
  semester?: string;
  tahunAjar?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return [];

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true } } },
  });
  const anakIds = ortu?.anak.map((a) => a.id) ?? [];
  if (anakIds.length === 0) return [];

  const where: any = {
    siswaId: params?.anakId ? params.anakId : { in: anakIds },
  };
  if (params?.semester)  where.semester  = params.semester as any;
  if (params?.tahunAjar) where.tahunAjar = params.tahunAjar;

  return prisma.sikap.findMany({
    where,
    include: {
      siswa: { select: { nama: true, nis: true, kelas: { select: { nama: true } } } },
    },
    orderBy: { tanggal: "desc" },
  });
}

export async function getStatistikSikapAnak(anakId: number) {
  const grouped = await prisma.sikap.groupBy({
    by: ["predikat"],
    where: { siswaId: anakId },
    _count: { predikat: true },
  });
  const result = { SB: 0, B: 0, C: 0, K: 0 };
  grouped.forEach((g) => { result[g.predikat as keyof typeof result] = g._count.predikat; });
  return result;
}