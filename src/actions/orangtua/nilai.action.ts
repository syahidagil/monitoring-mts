"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import type { Semester } from "@prisma/client";

const URUTAN = ["TUGAS", "PR", "HARIAN", "UTS", "UAS"] as const;
const LABEL: Record<string, string> = {
  TUGAS: "Tugas", PR: "PR", HARIAN: "UH", UTS: "UTS", UAS: "UAS",
};

/** Monitoring nilai anak — dikelompokkan per mapel, kolom per jenis (sesuai desain). */
export async function getNilaiAnak(opts: { siswaId?: number; tahunAjar?: string; semester?: Semester }) {
  const anak = await resolveAnak(opts.siswaId);
  if (!anak) return null;

  const opsiRaw = await prisma.nilai.findMany({
    where: { siswaId: anak.id },
    select: { tahunAjar: true, semester: true },
    distinct: ["tahunAjar", "semester"],
    orderBy: [{ tahunAjar: "desc" }, { semester: "desc" }],
  });

  const fallbackTahunAjar = anak.kelas.tahunAjaran.nama;
  const fallbackSemester = anak.kelas.tahunAjaran.semester;
  const tahunAjar = opts.tahunAjar ?? opsiRaw[0]?.tahunAjar ?? fallbackTahunAjar;
  const semester = opts.semester ?? opsiRaw.find((o) => o.tahunAjar === tahunAjar)?.semester ?? fallbackSemester;

  const tahunAjarList = Array.from(new Set(opsiRaw.map((o) => o.tahunAjar)));
  const semesterOptions: Semester[] = ["GANJIL", "GENAP"];

  const rows = await prisma.nilai.findMany({
    where: { siswaId: anak.id, semester, tahunAjar },
    include: { guruMapel: { include: { mataPelajaran: true } } },
    orderBy: { tanggal: "asc" },
  });

  const map = new Map<string, {
    kodeMapel: string; namaMapel: string;
    perJenis: Record<string, number | null>; nilaiList: number[];
  }>();
  for (const r of rows) {
    const kode = r.guruMapel.mataPelajaran.kodeMapel;
    if (!map.has(kode)) {
      map.set(kode, {
        kodeMapel: kode,
        namaMapel: r.guruMapel.mataPelajaran.namaMapel,
        perJenis: Object.fromEntries(URUTAN.map((j) => [j, null])),
        nilaiList: [],
      });
    }
    const m = map.get(kode)!;
    const angka = Number(r.nilai);
    m.perJenis[r.jenis] = angka;
    m.nilaiList.push(angka);
  }

  const perMapel = Array.from(map.values()).map((m) => ({
    kodeMapel: m.kodeMapel,
    namaMapel: m.namaMapel,
    perJenis: m.perJenis,
    rataRata: m.nilaiList.length > 0
      ? Number((m.nilaiList.reduce((a, b) => a + b, 0) / m.nilaiList.length).toFixed(1))
      : 0,
  }));

  const semua = rows.map((r) => Number(r.nilai));
  return {
    anak,
    semester,
    tahunAjar,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [fallbackTahunAjar],
    semesterOptions,
    urutanJenis: URUTAN.map((j) => ({ key: j, label: LABEL[j] })),
    perMapel,
    ringkasan: {
      rataKeseluruhan: semua.length > 0 ? Number((semua.reduce((a, b) => a + b, 0) / semua.length).toFixed(1)) : 0,
      jumlahMapel: perMapel.length,
    },
  };
}