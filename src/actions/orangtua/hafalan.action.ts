"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getHafalanAnak(params?: { anakId?: number }) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return [];

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true } } },
  });
  const anakIds = ortu?.anak.map((a) => a.id) ?? [];
  if (anakIds.length === 0) return [];

  return prisma.hafalan.findMany({
    where: { siswaId: params?.anakId ? params.anakId : { in: anakIds } },
    include: {
      siswa: { select: { nama: true, nis: true, kelas: { select: { nama: true } } } },
    },
    orderBy: { tanggal: "desc" },
  });
}

export async function getProgressHafalanAnak(anakId: number) {
  const hafalan = await prisma.hafalan.findMany({ where: { siswaId: anakId } });
  return {
    total:     hafalan.length,
    lulus:     hafalan.filter((h) => h.status === "LULUS").length,
    proses:    hafalan.filter((h) => h.status === "PROSES").length,
    mengulang: hafalan.filter((h) => h.status === "MENGULANG").length,
    belum:     hafalan.filter((h) => h.status === "BELUM").length,
  };
}