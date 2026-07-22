"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getTahsinAnak(params?: { anakId?: number }) {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return [];

  const ortu = await prisma.orangTua.findUnique({
    where: { id: session.user.id },
    include: { anak: { select: { id: true } } },
  });
  const anakIds = ortu?.anak.map((a) => a.id) ?? [];
  if (anakIds.length === 0) return [];

  return prisma.tahsin.findMany({
    where: { siswaId: params?.anakId ? params.anakId : { in: anakIds } },
    include: {
      siswa: { select: { nama: true, nis: true, kelas: { select: { nama: true } } } },
    },
    orderBy: { tanggal: "desc" },
  });
}

export async function getProgressTahsinAnak(anakId: number) {
  const tahsin = await prisma.tahsin.findMany({ where: { siswaId: anakId } });
  return {
    total:     tahsin.length,
    lulus:     tahsin.filter((t) => t.status === "LULUS").length,
    proses:    tahsin.filter((t) => t.status === "PROSES").length,
    mengulang: tahsin.filter((t) => t.status === "MENGULANG").length,
  };
}