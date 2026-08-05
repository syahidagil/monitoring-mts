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

  const [absensiTerbaru, nilai, sikap, tahsin, hafalan] = await prisma.$transaction([
    prisma.absensi.findMany({
      where: { siswaId: { in: anakIds } },
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        siswa: { select: { id: true, nama: true } },
        jadwal: { include: { mataPelajaran: { select: { namaMapel: true } } } },
      },
    }),
    prisma.nilai.findMany({
      where: { siswaId: { in: anakIds } },
      take: 5,
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      include: {
        siswa: { select: { id: true, nama: true } },
        guruMapel: { include: { mataPelajaran: { select: { namaMapel: true } } } },
      },
    }),
    prisma.sikap.findMany({
      where: { siswaId: { in: anakIds } },
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { siswa: { select: { id: true, nama: true } } },
    }),
    prisma.tahsin.findMany({
      where: { siswaId: { in: anakIds } },
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { siswa: { select: { id: true, nama: true } } },
    }),
    prisma.hafalan.findMany({
      where: { siswaId: { in: anakIds } },
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { siswa: { select: { id: true, nama: true } } },
    }),
  ]);

  type MonitoringTerbaru = {
    key: string;
    jenis: "Absensi" | "Nilai" | "Sikap" | "Tahsin" | "Hafalan";
    judul: string;
    deskripsi: string;
    tanggal: Date;
    href: string;
  };

  const monitoringTerbaru: MonitoringTerbaru[] = [
    ...absensiTerbaru.map((r) => ({
      key: `absensi-${r.id}`,
      jenis: "Absensi" as const,
      judul: `${r.status}`,
      deskripsi: `${r.siswa.nama} • ${r.jadwal.mataPelajaran.namaMapel}`,
      tanggal: r.createdAt,
      href: `/orangtua/absensi?siswaId=${r.siswa.id}`,
    })),
    ...nilai.map((r) => ({
      key: `nilai-${r.id}`,
      jenis: "Nilai" as const,
      judul: `${r.jenis} ${Number(r.nilai)}`,
      deskripsi: `${r.siswa.nama} • ${r.guruMapel.mataPelajaran.namaMapel}`,
      tanggal: r.tanggal,
      href: `/orangtua/nilai?siswaId=${r.siswa.id}`,
    })),
    ...sikap.map((r) => ({
      key: `sikap-${r.id}`,
      jenis: "Sikap" as const,
      judul: r.jenisSikap === "POSITIF" ? "Sikap Positif" : "Pelanggaran",
      deskripsi: `${r.siswa.nama} • ${r.kategori}`,
      tanggal: r.createdAt,
      href: `/orangtua/sikap?siswaId=${r.siswa.id}`,
    })),
    ...tahsin.map((r) => ({
      key: `tahsin-${r.id}`,
      jenis: "Tahsin" as const,
      judul: `Tahsin Juz ${r.juz}`,
      deskripsi: `${r.siswa.nama} • ${r.surat}`,
      tanggal: r.createdAt,
      href: `/orangtua/tahsin?siswaId=${r.siswa.id}`,
    })),
    ...hafalan.map((r) => ({
      key: `hafalan-${r.id}`,
      jenis: "Hafalan" as const,
      judul: `Hafalan Juz ${r.juz}`,
      deskripsi: `${r.siswa.nama} • ${r.surat}`,
      tanggal: r.createdAt,
      href: `/orangtua/hafalan?siswaId=${r.siswa.id}`,
    })),
  ]
    .sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())
    .slice(0, 5);

  return {
    ortu: { user: ortu.user, anak: ortu.anak },
    absensiMap,
    monitoringTerbaru,
    nilaiTerbaru: nilai.map((n) => ({
      id: n.id,
      nilai: Number(n.nilai),
      jenis: n.jenis,
      mapel: n.guruMapel.mataPelajaran.namaMapel,
      siswaNama: n.siswa.nama,
    })),
  };
}