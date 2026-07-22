"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getAnakIds(): Promise<number[]> {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return [];
  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true } } },
  });
  return ortu?.anak.map((a) => a.id) ?? [];
}

export async function getDashboardOrangTua() {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return null;

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: {
      user: { select: { name: true } },
      anak: {
        include: {
          kelas: { include: { tahunAjaran: { select: { nama: true, semester: true } } } },
          _count: {
            select: { absensi: true, nilai: true, hafalan: true, tahsin: true, sikap: true },
          },
        },
      },
    },
  });
  if (!ortu) return null;

  // Ringkasan absensi bulan ini untuk semua anak
  const anakIds = ortu.anak.map((a) => a.id);
  const now     = new Date();
  const start   = new Date(now.getFullYear(), now.getMonth(), 1);
  const end     = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const absensiMonth = await prisma.absensi.groupBy({
    by: ["siswaId", "status"],
    where: { siswaId: { in: anakIds }, tanggal: { gte: start, lte: end } },
    _count: { status: true },
  });

  const absensiMap: Record<number, Record<string, number>> = {};
  anakIds.forEach((id) => { absensiMap[id] = { HADIR:0, SAKIT:0, IZIN:0, ALPHA:0 }; });
  absensiMonth.forEach((a) => { absensiMap[a.siswaId][a.status] = a._count.status; });

  const nilaiTerbaru = await prisma.nilai.findMany({
    where: { siswaId: { in: anakIds } },
    orderBy: { tanggal: "desc" },
    take: 5,
    include: { siswa: { select: { nama: true } } },
  });

  return { ortu, absensiMap, nilaiTerbaru };
}