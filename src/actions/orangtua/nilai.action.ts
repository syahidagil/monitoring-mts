"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getNilaiAnak(params?: {
  anakId?: number;
  mapel?: string;
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
  if (params?.mapel)     where.mapel    = params.mapel;
  if (params?.semester)  where.semester  = params.semester as any;
  if (params?.tahunAjar) where.tahunAjar = params.tahunAjar;

  return prisma.nilai.findMany({
    where,
    include: {
      siswa: { select: { nama: true, nis: true, kelas: { select: { nama: true } } } },
    },
    orderBy: [{ mapel: "asc" }, { jenis: "asc" }, { tanggal: "desc" }],
  });
}

export async function getRataRataNilaiAnak(anakId: number, tahunAjar?: string) {
  const where: any = { siswaId: anakId };
  if (tahunAjar) where.tahunAjar = tahunAjar;

  const nilai = await prisma.nilai.findMany({ where });
  const mapMap = new Map<string, number[]>();
  nilai.forEach((n) => {
    if (!mapMap.has(n.mapel)) mapMap.set(n.mapel, []);
    mapMap.get(n.mapel)!.push(Number(n.nilai));
  });

  return Array.from(mapMap.entries()).map(([mapel, vals]) => ({
    mapel,
    rata: vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0,
    count: vals.length,
  })).sort((a, b) => b.rata - a.rata);
}