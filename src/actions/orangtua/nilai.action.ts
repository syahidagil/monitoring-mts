"use server";

import { prisma } from "@/lib/prisma";
import { resolveAnak } from "./dashboard.action";
import { hitungNilaiRapor } from "@/lib/nilai/rapor";
import type { Semester } from "@prisma/client";

const URUTAN = ["TUGAS", "PR", "HARIAN", "UTS", "UAS"] as const;
const LABEL: Record<string, string> = {
  TUGAS: "Tugas", PR: "PR", HARIAN: "UH", UTS: "UTS", UAS: "UAS",
};

/** Monitoring nilai anak - dikelompokkan per mapel, kolom per jenis (sesuai desain). */
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
    perJenisList: Record<string, number[]>; nilaiList: { jenis: string; nilai: number }[];
  }>();
  for (const r of rows) {
    const kode = r.guruMapel.mataPelajaran.kodeMapel;
    if (!map.has(kode)) {
      map.set(kode, {
        kodeMapel: kode,
        namaMapel: r.guruMapel.mataPelajaran.namaMapel,
        perJenisList: Object.fromEntries(URUTAN.map((j) => [j, []])),
        nilaiList: [],
      });
    }
    const m = map.get(kode)!;
    const angka = Number(r.nilai);
    // Satu jenis (mis. HARIAN) bisa punya beberapa nilai dari tanggal berbeda
    // (lihat fitur "nilai berulang") -> ditampung semua, bukan ditimpa.
    m.perJenisList[r.jenis]?.push(angka);
    m.nilaiList.push({ jenis: r.jenis, nilai: angka });
  }

  const perMapel = Array.from(map.values()).map((m) => {
    const rapor = hitungNilaiRapor(m.nilaiList);
    // Untuk ditampilkan per kolom jenis: kalau lebih dari 1 nilai pada jenis
    // yang sama, tampilkan rata-ratanya (bukan cuma nilai terakhir).
    const perJenis: Record<string, number | null> = {};
    for (const j of URUTAN) {
      const vals = m.perJenisList[j];
      perJenis[j] = vals.length > 0
        ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
        : null;
    }
    return {
      kodeMapel: m.kodeMapel,
      namaMapel: m.namaMapel,
      perJenis,
      rataRata: rapor.nilaiAkhir ?? 0,
      lengkap: rapor.lengkap,
    };
  });

  return {
    anak,
    semester,
    tahunAjar,
    tahunAjarList: tahunAjarList.length > 0 ? tahunAjarList : [fallbackTahunAjar],
    semesterOptions,
    urutanJenis: URUTAN.map((j) => ({ key: j, label: LABEL[j] })),
    perMapel,
    ringkasan: {
      // Rata-rata dari Nilai Akhir tiap mapel (setiap mapel berbobot sama),
      // BUKAN rata-rata seluruh nilai mentah -> mapel dengan banyak input
      // (misal karena sering ulangan harian) tidak jadi lebih berpengaruh.
      rataKeseluruhan: perMapel.length > 0
        ? Number((perMapel.reduce((a, m) => a + m.rataRata, 0) / perMapel.length).toFixed(1))
        : 0,
      jumlahMapel: perMapel.length,
    },
  };
}