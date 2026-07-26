"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";

/** Monitoring absensi anak. Filter bulan+tahun (Absensi terikat Jadwal). */
export async function getAbsensiAnak(opts: { siswaId?: number; bulan?: number; tahun?: number }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const now = new Date();
  const bulan = opts.bulan ?? now.getMonth() + 1;
  const tahun = opts.tahun ?? now.getFullYear();
  const awal = new Date(tahun, bulan - 1, 1);
  const akhir = new Date(tahun, bulan, 0, 23, 59, 59);

  const rows = await prisma.absensi.findMany({
    where: { siswaId: anak.id, tanggal: { gte: awal, lte: akhir } },
    orderBy: { tanggal: "desc" },
    include: {
      jadwal: { include: { mataPelajaran: { select: { namaMapel: true } } } },
    },
  });

  const rekap = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
  for (const r of rows) rekap[r.status]++;
  const total = rows.length;

  return {
    anak, bulan, tahun,
    rekap,
    persentase: total > 0 ? Math.round((rekap.HADIR / total) * 100) : 0,
    rows: rows.map((r) => ({
      id: r.id,
      tanggal: r.tanggal,
      status: r.status,
      mapel: r.jadwal.mataPelajaran.namaMapel,
      keterangan: r.keterangan ?? "",
    })),
  };
}