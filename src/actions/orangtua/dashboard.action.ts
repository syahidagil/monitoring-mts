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
  const anakAktifId = ortu.anak[0]?.id;
  const now = new Date();

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

  const nilaiUntukGrafik = await prisma.nilai.findMany({
    where: anakAktifId ? { siswaId: anakAktifId } : { siswaId: { in: [] } },
    select: { nilai: true, tanggal: true },
    orderBy: { tanggal: "asc" },
  });

  const bulanMap = new Map<string, { label: string; total: number; count: number }>();
  const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(nowMonth.getFullYear(), nowMonth.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    bulanMap.set(key, {
      label: d.toLocaleDateString("id-ID", { month: "short" }),
      total: 0,
      count: 0,
    });
  }

  for (const n of nilaiUntukGrafik) {
    const d = new Date(n.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bulanMap.get(key);
    if (!bucket) continue;
    bucket.total += Number(n.nilai);
    bucket.count += 1;
  }

  const nilaiPerkembangan = Array.from(bulanMap.values()).map((b) => ({
    label: b.label,
    jumlah: b.count > 0 ? Number((b.total / b.count).toFixed(1)) : 0,
  }));

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

  const ringkasanTerbaru = {
    updateTerakhir: monitoringTerbaru[0] ?? null,
    absensi: absensiTerbaru[0]
      ? {
          judul: absensiTerbaru[0].status,
          deskripsi: `${absensiTerbaru[0].siswa.nama} • ${absensiTerbaru[0].jadwal.mataPelajaran.namaMapel}`,
          tanggal: absensiTerbaru[0].createdAt,
        }
      : null,
    nilai: nilai[0]
      ? {
          judul: `${nilai[0].jenis} ${Number(nilai[0].nilai)}`,
          deskripsi: `${nilai[0].siswa.nama} • ${nilai[0].guruMapel.mataPelajaran.namaMapel}`,
          tanggal: nilai[0].tanggal,
        }
      : null,
    sikap: sikap[0]
      ? {
          judul: sikap[0].jenisSikap === "POSITIF" ? "Sikap Positif" : "Pelanggaran",
          deskripsi: `${sikap[0].siswa.nama} • ${sikap[0].kategori}`,
          tanggal: sikap[0].createdAt,
        }
      : null,
    tahsin: tahsin[0]
      ? {
          judul: `Juz ${tahsin[0].juz}`,
          deskripsi: `${tahsin[0].siswa.nama} • ${tahsin[0].surat}`,
          tanggal: tahsin[0].createdAt,
        }
      : null,
    hafalan: hafalan[0]
      ? {
          judul: `Juz ${hafalan[0].juz}`,
          deskripsi: `${hafalan[0].siswa.nama} • ${hafalan[0].surat}`,
          tanggal: hafalan[0].createdAt,
        }
      : null,
  };

  return {
    ortu: { user: ortu.user, anak: ortu.anak },
    anakAktifId,
    anakAktifNama: ortu.anak.find((a) => a.id === anakAktifId)?.nama ?? null,
    ringkasanTerbaru,
    monitoringTerbaru,
    nilaiPerkembangan,
    nilaiTerbaru: nilai.map((n) => ({
      id: n.id,
      nilai: Number(n.nilai),
      jenis: n.jenis,
      mapel: n.guruMapel.mataPelajaran.namaMapel,
      siswaNama: n.siswa.nama,
    })),
  };
}