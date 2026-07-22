"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

// ── REKAP ABSENSI ─────────────────────────────────────────────────────────────
export async function getRekapAbsensiGuru(params?: {
  kelasId?: number;
  tanggalMulai?: string;
  tanggalAkhir?: string;
}) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId, ...(params?.kelasId && { kelasId: params.kelasId }) },
    select: { id: true, mapel: true, kelas: { select: { nama: true } } },
  });
  const jadwalIds = jadwal.map((j) => j.id);

  const where: any = { jadwalId: { in: jadwalIds } };
  if (params?.tanggalMulai) where.tanggal = { gte: new Date(params.tanggalMulai) };
  if (params?.tanggalAkhir) where.tanggal = { ...where.tanggal, lte: new Date(params.tanggalAkhir) };

  const absensi = await prisma.absensi.findMany({
    where,
    include: {
      siswa: { select: { id: true, nis: true, nama: true } },
      jadwal: { select: { mapel: true, kelas: { select: { nama: true } } } },
    },
    orderBy: [{ tanggal: "desc" }, { siswa: { nama: "asc" } }],
  });

  // Agregasi per siswa
  const map = new Map<number, any>();
  absensi.forEach((a) => {
    if (!map.has(a.siswaId)) {
      map.set(a.siswaId, {
        siswa: a.siswa,
        kelas: a.jadwal.kelas.nama,
        HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0, total: 0,
      });
    }
    const row = map.get(a.siswaId);
    row[a.status]++;
    row.total++;
  });

  return Array.from(map.values()).sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
}

// ── REKAP NILAI ───────────────────────────────────────────────────────────────
export async function getRekapNilaiGuru(params?: {
  kelasId?: number;
  mapel?: string;
  semester?: string;
  tahunAjar?: string;
}) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  const where: any = { guruId };
  if (params?.mapel)     where.mapel    = params.mapel;
  if (params?.semester)  where.semester  = params.semester;
  if (params?.tahunAjar) where.tahunAjar = params.tahunAjar;
  if (params?.kelasId)   where.siswa     = { kelasId: params.kelasId };

  const nilai = await prisma.nilai.findMany({
    where,
    include: {
      siswa: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
    },
    orderBy: [{ siswa: { nama: "asc" } }, { jenis: "asc" }],
  });

  // Agregasi per siswa
  const map = new Map<number, any>();
  nilai.forEach((n) => {
    if (!map.has(n.siswaId)) {
      map.set(n.siswaId, {
        siswa: n.siswa,
        kelas: n.siswa.kelas.nama,
        nilaiList: [],
        rata: 0,
      });
    }
    map.get(n.siswaId).nilaiList.push({ jenis: n.jenis, nilai: Number(n.nilai) });
  });

  map.forEach((row) => {
    const vals = row.nilaiList.map((n: any) => n.nilai);
    row.rata = vals.length ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1) : 0;
  });

  return Array.from(map.values()).sort((a, b) => a.siswa.nama.localeCompare(b.siswa.nama));
}

// ── REKAP SIKAP ───────────────────────────────────────────────────────────────
export async function getRekapSikapGuru(params?: {
  kelasId?: number;
  semester?: string;
  tahunAjar?: string;
}) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId, ...(params?.kelasId && { kelasId: params.kelasId }) },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.sikap.findMany({
    where: {
      siswa: { kelasId: { in: kelasIds } },
      ...(params?.semester  && { semester:  params.semester  as any }),
      ...(params?.tahunAjar && { tahunAjar: params.tahunAjar }),
    },
    include: {
      siswa: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
    },
    orderBy: [{ siswa: { nama: "asc" } }, { tanggal: "desc" }],
  });
}

// ── REKAP HAFALAN ─────────────────────────────────────────────────────────────
export async function getRekapHafalanGuru(params?: { kelasId?: number }) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId, ...(params?.kelasId && { kelasId: params.kelasId }) },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.hafalan.findMany({
    where: { siswa: { kelasId: { in: kelasIds }, statusTahfidz: true } },
    include: {
      siswa: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
    },
    orderBy: [{ siswa: { nama: "asc" } }, { tanggal: "desc" }],
  });
}

// ── REKAP TAHSIN ──────────────────────────────────────────────────────────────
export async function getRekapTahsinGuru(params?: { kelasId?: number }) {
  const guruId = await getGuruId();
  if (!guruId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId, ...(params?.kelasId && { kelasId: params.kelasId }) },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.tahsin.findMany({
    where: { siswa: { kelasId: { in: kelasIds } } },
    include: {
      siswa: {
        select: {
          id: true, nis: true, nama: true,
          kelas: { select: { nama: true } },
        },
      },
    },
    orderBy: [{ siswa: { nama: "asc" } }, { tanggal: "desc" }],
  });
}

// ── DATA KELAS GURU ───────────────────────────────────────────────────────────
export async function getKelasGuru() {
  const guruId = await getGuruId();
  if (!guruId) return [];
  const jadwal = await prisma.jadwal.findMany({
    where: { guruId },
    include: { kelas: { select: { id: true, nama: true, tingkat: true } } },
    distinct: ["kelasId"],
  });
  return jadwal.map((j) => j.kelas);
}

export async function getMapelGuru() {
  const guruId = await getGuruId();
  if (!guruId) return [];
  const jadwal = await prisma.jadwal.findMany({
    where: { guruId },
    select: { mapel: true },
    distinct: ["mapel"],
  });
  return jadwal.map((j) => j.mapel);
}