"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** ID orang tua dari session; null bila bukan ORANGTUA. */
export async function getOrangTuaId(): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "ORANGTUA") return null;
  return session.user.id;
}

/** Daftar anak milik orang tua yang login. */
export async function getAnakList() {
  const id = await getOrangTuaId();
  if (!id) return [];
  return prisma.siswa.findMany({
    where: { orangTuaId: id, status: true },
    select: {
      id: true, nis: true, nama: true, statusTahfidz: true,
      kelas: { select: { id: true, nama: true, tahunAjaran: { select: { nama: true, semester: true } } } },
    },
    orderBy: { nama: "asc" },
  });
}

/**
 * LAPISAN KEAMANAN. siswaId dari URL bisa dimanipulasi; fungsi ini memastikan
 * siswa itu benar anak dari orang tua yang login. Tanpa siswaId -> anak pertama.
 */
export async function resolveAnak(siswaId?: number) {
  const id = await getOrangTuaId();
  if (!id) return null;
  return prisma.siswa.findFirst({
    where: { orangTuaId: id, status: true, ...(siswaId ? { id: siswaId } : {}) },
    select: {
      id: true, nis: true, nama: true, statusTahfidz: true,
      kelas: { select: { id: true, nama: true, tahunAjaran: { select: { nama: true, semester: true } } } },
    },
    orderBy: { nama: "asc" },
  });
}

/** Ringkasan untuk dashboard: kartu statistik gabungan semua anak. */
export async function getDashboardOrangTua() {
  const id = await getOrangTuaId();
  if (!id) return null;

  const ortu = await prisma.orangTua.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      anak: {
        where: { status: true },
        select: {
          id: true, nis: true, nama: true, statusTahfidz: true,
          kelas: { select: { nama: true } },
          _count: { select: { nilai: true, hafalan: true, tahsin: true, sikap: true, absensi: true } },
        },
        orderBy: { nama: "asc" },
      },
    },
  });
  if (!ortu) return null;

  const anakIds = ortu.anak.map((a) => a.id);
  const now = new Date();
  const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);

  // Absensi bulan ini per anak
  const absensi = await prisma.absensi.groupBy({
    by: ["siswaId", "status"],
    where: { siswaId: { in: anakIds }, tanggal: { gte: awalBulan } },
    _count: { _all: true },
  });
  const absensiMap: Record<number, Record<string, number>> = {};
  for (const a of anakIds) absensiMap[a] = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
  for (const row of absensi) absensiMap[row.siswaId][row.status] = row._count._all;

  // 5 nilai terbaru (semua anak)
  const nilai = await prisma.nilai.findMany({
    where: { siswaId: { in: anakIds } },
    take: 5,
    orderBy: { tanggal: "desc" },
    include: {
      siswa: { select: { nama: true } },
      guruMapel: { include: { mataPelajaran: { select: { namaMapel: true } } } },
    },
  });

  return {
    ortu: { user: ortu.user, anak: ortu.anak },
    absensiMap,
    nilaiTerbaru: nilai.map((n) => ({
      id: n.id, nilai: Number(n.nilai), jenis: n.jenis,
      mapel: n.guruMapel.mataPelajaran.namaMapel, siswaNama: n.siswa.nama,
    })),
  };
}