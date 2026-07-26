"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";

/** Monitoring hafalan (tahfidz) anak. Hafalan tak punya semester -> pakai seluruh data. */
export async function getHafalanAnak(opts: { siswaId?: number }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const rows = await prisma.hafalan.findMany({
    where: { siswaId: anak.id },
    orderBy: { tanggal: "desc" },
    include: { guru: { include: { user: { select: { name: true } } } } },
  });

  const juzSet = new Set(rows.map((r) => r.juz));
  const juzTertinggi = rows.length > 0 ? Math.max(...rows.map((r) => r.juz)) : 0;
  const totalHalaman = new Set(rows.map((r) => r.halaman)).size;
  const lancar = rows.filter((r) => r.nilai === "L").length;

  // Progres 4 minggu terakhir + hari ini (jumlah setoran per minggu)
  const now = new Date();
  const perMinggu: { label: string; jumlah: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const akhir = new Date(now); akhir.setDate(now.getDate() - i * 7);
    const awal = new Date(akhir); awal.setDate(akhir.getDate() - 6);
    const jml = rows.filter((r) => {
      const t = new Date(r.tanggal);
      return t >= awal && t <= akhir;
    }).length;
    perMinggu.push({ label: i === 0 ? "Hari Ini" : `Minggu ${4 - i}`, jumlah: jml });
  }

  return {
    anak,
    ringkasan: {
      juzTertinggi,
      jumlahJuz: juzSet.size,
      totalHalaman,
      totalSetoran: rows.length,
      lancar,
      persentaseProgres: rows.length > 0 ? Math.round((lancar / rows.length) * 100) : 0,
      targetJuz: 30,
    },
    perMinggu,
    rows: rows.map((r) => ({
      id: r.id, tanggal: r.tanggal, hari: r.hari, juz: r.juz,
      surat: r.surat, halaman: r.halaman, nilai: r.nilai,
      keterangan: r.keterangan ?? "", guruNama: r.guru.user.name,
    })),
  };
}