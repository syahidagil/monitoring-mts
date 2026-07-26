"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";

/** Monitoring tahsin anak (3 aspek: tajwid, makhraj, sifatul). */
export async function getTahsinAnak(opts: { siswaId?: number }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const rows = await prisma.tahsin.findMany({
    where: { siswaId: anak.id },
    orderBy: { tanggal: "desc" },
    include: { guru: { include: { user: { select: { name: true } } } } },
  });

  const total = rows.length;
  const persen = (k: "tajwid" | "makhraj" | "sifatul") =>
    total > 0 ? Math.round((rows.filter((r) => r[k] === "L").length / total) * 100) : 0;

  return {
    anak,
    aspek: [
      { nama: "Tajwid", persen: persen("tajwid") },
      { nama: "Makhraj", persen: persen("makhraj") },
      { nama: "Sifatul Huruf", persen: persen("sifatul") },
    ],
    ringkasan: { totalSetoran: total, juzTersentuh: new Set(rows.map((r) => r.juz)).size },
    rows: rows.map((r) => ({
      id: r.id, tanggal: r.tanggal, hari: r.hari, juz: r.juz, surat: r.surat,
      halaman: r.halaman, tajwid: r.tajwid, makhraj: r.makhraj, sifatul: r.sifatul,
      keterangan: r.keterangan ?? "", guruNama: r.guru.user.name,
    })),
  };
}