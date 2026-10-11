"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import type { Semester } from "@prisma/client";

/** Monitoring absensi anak. Filter bulan+tahun pelajaran (Absensi terikat Jadwal). */
export async function getAbsensiAnak(opts: { siswaId?: number; bulan?: number; tahunAjar?: string; semester?: Semester; guruId?: string }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const now = new Date();
  const bulan = opts.bulan ?? now.getMonth() + 1;

  const tahunAjaranList = await prisma.tahunAjaran.findMany({
    where: {
      jadwal: {
        some: {
          absensi: {
            some: { siswaId: anak.id },
          },
        },
      },
    },
    select: { id: true, nama: true, semester: true, aktif: true },
    orderBy: [{ nama: "desc" }, { semester: "desc" }],
  });

  const fallbackTahunAjar = anak.kelas.tahunAjaran.nama;
  const fallbackSemester = anak.kelas.tahunAjaran.semester;
  const tahunAjar = opts.tahunAjar ?? tahunAjaranList.find((t) => t.aktif)?.nama ?? tahunAjaranList[0]?.nama ?? fallbackTahunAjar;
  const semester = opts.semester ?? tahunAjaranList.find((t) => t.aktif)?.semester ?? tahunAjaranList[0]?.semester ?? fallbackSemester;

  const semesterOptions: Semester[] = ["GANJIL", "GENAP"];
  const tahunAjarList = Array.from(new Set(tahunAjaranList.map((t) => t.nama)));

  const rows = await prisma.absensi.findMany({
    where: {
      siswaId: anak.id,
      jadwal: {
        tahunAjaran: {
          nama: tahunAjar,
          semester,
        },
      },
    },
    orderBy: { tanggal: "desc" },
    include: {
      jadwal: {
        include: {
          mataPelajaran: { select: { namaMapel: true } },
          guru: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  const guruList = Array.from(new Map(rows.map((row) => [row.jadwal.guruId, {
    id: row.jadwal.guruId,
    nama: row.jadwal.guru.user.name,
  }])).values());
  const guruId = guruList.some((item) => item.id === opts.guruId) ? opts.guruId : undefined;
  const rowsFilteredGuru = guruId
    ? rows.filter((row) => row.jadwal.guruId === guruId)
    : rows;
  const rowsFilteredBulan = rowsFilteredGuru.filter((r) => {
    const tanggal = new Date(r.tanggal);
    return tanggal.getMonth() + 1 === bulan;
  });

  const rekap = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
  for (const r of rowsFilteredBulan) rekap[r.status]++;
  const total = rowsFilteredBulan.length;

  return {
    anak,
    bulan,
    tahunAjar,
    semester,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [fallbackTahunAjar],
    semesterOptions,
    guruList,
    guruId: guruId ?? null,
    rekap,
    persentase: total > 0 ? Math.round((rekap.HADIR / total) * 100) : 0,
    rows: rowsFilteredBulan.map((r) => ({
      id: r.id,
      tanggal: r.tanggal,
      status: r.status,
      mapel: r.jadwal.mataPelajaran.namaMapel,
      keterangan: r.keterangan ?? "",
    })),
  };
}