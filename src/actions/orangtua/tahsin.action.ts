"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import type { Semester } from "@prisma/client";

function getPeriodeAkademik(tanggal: Date): { tahunAjar: string; semester: Semester } {
  const d = new Date(tanggal);
  const bulan = d.getMonth() + 1;
  if (bulan >= 7) {
    return { tahunAjar: `${d.getFullYear()}/${d.getFullYear() + 1}`, semester: "GANJIL" };
  }
  return { tahunAjar: `${d.getFullYear() - 1}/${d.getFullYear()}`, semester: "GENAP" };
}

/** Monitoring tahsin anak (3 aspek: tajwid, makhraj, sifatul). */
export async function getTahsinAnak(opts: { siswaId?: number; tahunAjar?: string; semester?: Semester }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const rows = await prisma.tahsin.findMany({
    where: { siswaId: anak.id },
    orderBy: { tanggal: "desc" },
    include: { guru: { include: { user: { select: { name: true } } } } },
  });

  const rowsDenganPeriode = rows.map((r) => {
    const periode = getPeriodeAkademik(r.tanggal);
    return { ...r, tahunAjar: periode.tahunAjar, semester: periode.semester };
  });

  const nowPeriode = getPeriodeAkademik(new Date());
  const tahunAjarList = Array.from(new Set(rowsDenganPeriode.map((r) => r.tahunAjar))).sort((a, b) => b.localeCompare(a));
  const tahunAjar = opts.tahunAjar ?? tahunAjarList[0] ?? nowPeriode.tahunAjar;
  const semester = opts.semester ?? nowPeriode.semester;
  const semesterOptions: Semester[] = ["GANJIL", "GENAP"];

  const rowsFiltered = rowsDenganPeriode.filter((r) => r.tahunAjar === tahunAjar && r.semester === semester);

  const total = rowsFiltered.length;
  const persen = (k: "tajwid" | "makhraj" | "sifatul") =>
    total > 0 ? Math.round((rowsFiltered.filter((r) => r[k] === "L").length / total) * 100) : 0;

  return {
    anak,
    tahunAjar,
    semester,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [nowPeriode.tahunAjar],
    semesterOptions,
    aspek: [
      { nama: "Tajwid", persen: persen("tajwid") },
      { nama: "Makhraj", persen: persen("makhraj") },
      { nama: "Sifatul Huruf", persen: persen("sifatul") },
    ],
    ringkasan: { totalSetoran: total, juzTersentuh: new Set(rowsFiltered.map((r) => r.juz)).size },
    rows: rowsFiltered.map((r) => ({
      id: r.id, tanggal: r.tanggal, hari: r.hari, juz: r.juz, surat: r.surat,
      halaman: r.halaman, tajwid: r.tajwid, makhraj: r.makhraj, sifatul: r.sifatul,
      keterangan: r.keterangan ?? "", guruNama: r.guru.user.name,
    })),
  };
}