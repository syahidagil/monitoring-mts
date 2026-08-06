"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";

function getPeriodeAkademik(tanggal: Date): { tahunAjar: string } {
  const d = new Date(tanggal);
  const bulan = d.getMonth() + 1;
  if (bulan >= 7) {
    return { tahunAjar: `${d.getFullYear()}/${d.getFullYear() + 1}` };
  }
  return { tahunAjar: `${d.getFullYear() - 1}/${d.getFullYear()}` };
}

/** Monitoring hafalan (tahfidz) anak. Hafalan berjalan terus dari awal sampai anak lulus. */
export async function getHafalanAnak(opts: { siswaId?: number; tahunAjar?: string }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const rows = await prisma.hafalan.findMany({
    where: { siswaId: anak.id },
    orderBy: { tanggal: "desc" },
    include: { guru: { include: { user: { select: { name: true } } } } },
  });

  const rowsDenganPeriode = rows.map((r) => {
    const periode = getPeriodeAkademik(r.tanggal);
    return { ...r, tahunAjar: periode.tahunAjar };
  });

  const nowPeriode = getPeriodeAkademik(new Date());
  const tahunAjarList = Array.from(new Set(rowsDenganPeriode.map((r) => r.tahunAjar))).sort((a, b) => b.localeCompare(a));
  const tahunAjar = opts.tahunAjar ?? tahunAjarList[0] ?? nowPeriode.tahunAjar;

  const rowsFiltered = rowsDenganPeriode.filter((r) => r.tahunAjar === tahunAjar);

  const juzSet = new Set(rowsFiltered.map((r) => r.juz));
  const juzTertinggi = rowsFiltered.length > 0 ? Math.max(...rowsFiltered.map((r) => r.juz)) : 0;
  const totalHalaman = new Set(rowsFiltered.map((r) => r.halaman)).size;
  const lancar = rowsFiltered.filter((r) => r.nilai === "L").length;

  // Progres 4 minggu terakhir + hari ini (jumlah setoran per minggu)
  const referensi = rowsFiltered[0]?.tanggal ? new Date(rowsFiltered[0].tanggal) : new Date();
  const perMinggu: { label: string; jumlah: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const akhir = new Date(referensi); akhir.setDate(referensi.getDate() - i * 7);
    const awal = new Date(akhir); awal.setDate(akhir.getDate() - 6);
    const jml = rowsFiltered.filter((r) => {
      const t = new Date(r.tanggal);
      return t >= awal && t <= akhir;
    }).length;
    perMinggu.push({ label: i === 0 ? "Hari Ini" : `Minggu ${4 - i}`, jumlah: jml });
  }

  return {
    anak,
    tahunAjar,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [nowPeriode.tahunAjar],
    ringkasan: {
      juzTertinggi,
      jumlahJuz: juzSet.size,
      totalHalaman,
      totalSetoran: rowsFiltered.length,
      lancar,
      persentaseProgres: rowsFiltered.length > 0 ? Math.round((lancar / rowsFiltered.length) * 100) : 0,
      targetJuz: 30,
    },
    perMinggu,
    rows: rowsFiltered.map((r) => ({
      id: r.id, tanggal: r.tanggal, hari: r.hari, juz: r.juz,
      surat: r.surat, halaman: r.halaman, nilai: r.nilai,
      keterangan: r.keterangan ?? "", guruNama: r.guru.user.name,
    })),
  };
}