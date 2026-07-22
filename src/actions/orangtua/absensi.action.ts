"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAbsensiAnak(params?: {
  anakId?: number;
  bulan?: number;
  tahun?: number;
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

  if (params?.bulan && params?.tahun) {
    const start = new Date(params.tahun, params.bulan - 1, 1);
    const end   = new Date(params.tahun, params.bulan, 0, 23, 59, 59);
    where.tanggal = { gte: start, lte: end };
  }

  return prisma.absensi.findMany({
    where,
    include: {
      jadwal: {
        select: {
          mapel: true,
          hari: true,
          jamMulai: true,
          jamSelesai: true,
        },
      },
      siswa: { select: { nama: true, nis: true, kelas: { select: { nama: true } } } },
    },
    orderBy: { tanggal: "desc" },
  });
}

export async function getRingkasanAbsensiAnak(anakId: number) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return null;

  const grouped = await prisma.absensi.groupBy({
    by: ["status"],
    where: { siswaId: anakId },
    _count: { status: true },
  });

  const result = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0, total: 0 };
  grouped.forEach((g) => {
    result[g.status as keyof typeof result] = g._count.status;
    result.total += g._count.status;
  });
  return result;
}