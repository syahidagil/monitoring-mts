"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import type { Semester } from "@prisma/client";

/**
 * Monitoring absensi anak (Absensi terikat Jadwal).
 * Filter: bulan (0 = semua bulan), tahun pelajaran, semester, dan mata pelajaran.
 */
export async function getAbsensiAnak(opts: {
  siswaId?: number;
  bulan?: number;
  tahunAjar?: string;
  semester?: Semester;
  kodeMapel?: string;
}) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const now = new Date();
  // 0 = semua bulan; tanpa pilihan, bawaannya bulan berjalan
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
        },
      },
    },
  });

  // Daftar mata pelajaran untuk filter: mapel yang pernah diabsen pada semester ini
  const mapelList = Array.from(
    new Map(
      rows.map((row) => [
        row.jadwal.kodeMapel,
        { kodeMapel: row.jadwal.kodeMapel, nama: row.jadwal.mataPelajaran.namaMapel },
      ])
    ).values()
  ).sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  const kodeMapel = mapelList.some((m) => m.kodeMapel === opts.kodeMapel)
    ? opts.kodeMapel
    : undefined;

  const rowsFilteredMapel = kodeMapel
    ? rows.filter((row) => row.jadwal.kodeMapel === kodeMapel)
    : rows;

  const rowsFiltered =
    bulan === 0
      ? rowsFilteredMapel
      : rowsFilteredMapel.filter((r) => new Date(r.tanggal).getMonth() + 1 === bulan);

  const rekap = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
  for (const r of rowsFiltered) rekap[r.status]++;
  const total = rowsFiltered.length;

  return {
    anak,
    bulan,
    tahunAjar,
    semester,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [fallbackTahunAjar],
    semesterOptions,
    mapelList,
    kodeMapel: kodeMapel ?? null,
    rekap,
    persentase: total > 0 ? Math.round((rekap.HADIR / total) * 100) : 0,
    rows: rowsFiltered.map((r) => ({
      id: r.id,
      tanggal: r.tanggal,
      status: r.status,
      mapel: r.jadwal.mataPelajaran.namaMapel,
      keterangan: r.keterangan ?? "",
    })),
  };
}