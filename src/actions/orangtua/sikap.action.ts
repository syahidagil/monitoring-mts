"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import type { Semester } from "@prisma/client";

/** Monitoring sikap anak. Filter semester + bulan (opsional). */
export async function getSikapAnak(opts: { siswaId?: number; semester?: Semester; bulan?: number }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const semester = opts.semester ?? anak.kelas.tahunAjaran.semester;
  const tahunAjar = anak.kelas.tahunAjaran.nama;

  const rows = await prisma.sikap.findMany({
    where: { siswaId: anak.id, semester, tahunAjar },
    orderBy: { tanggal: "desc" },
    include: { guru: { include: { user: { select: { name: true } } } } },
  });

  // Filter bulan di aplikasi (agar statistik "bulan ini" tetap dari data semester)
  const now = new Date();
  const bulan = opts.bulan ?? now.getMonth() + 1;
  const bulanRows = rows.filter((r) => new Date(r.tanggal).getMonth() + 1 === bulan);

  const positif = bulanRows.filter((r) => r.jenisSikap === "POSITIF").length;
  const pelanggaran = bulanRows.filter((r) => r.jenisSikap === "PELANGGARAN").length;

  return {
    anak, semester, tahunAjar, bulan,
    statistik: { total: bulanRows.length, positif, pelanggaran },
    rows: bulanRows.map((r) => ({
      id: r.id,
      tanggal: r.tanggal,
      jenisSikap: r.jenisSikap,
      kategori: r.kategori,
      keterangan: r.keterangan,
      guruNama: r.guru.user.name,
    })),
  };
}