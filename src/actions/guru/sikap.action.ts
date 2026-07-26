"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sikapSchema } from "@/lib/validations/guru/sikap.validation";
import type { JenisSikap, Semester } from "@prisma/client";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

async function kelasIdsGuru(guruId: string) {
  const jadwal = await prisma.jadwal.findMany({
    where: { guruId },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  return jadwal.map((j) => j.kelasId);
}

/** Data lengkap HALAMAN DAFTAR sikap: profil guru, statistik bulan ini, kelas, riwayat. */
export async function getDataHalamanSikap() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  const guruId = session.user.id;

  const [guru, tahunAktif, kelasIds] = await Promise.all([
    prisma.guru.findUnique({
      where: { id: guruId },
      include: { user: { select: { name: true } } },
    }),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
    kelasIdsGuru(guruId),
  ]);

  const kelasList = await prisma.kelas.findMany({
    where: { id: { in: kelasIds } },
    select: { id: true, nama: true },
    orderBy: { nama: "asc" },
  });

  const rows = await prisma.sikap.findMany({
    where: { guruId, siswa: { kelasId: { in: kelasIds } } },
    include: {
      siswa: { select: { id: true, nis: true, nama: true, kelasId: true, kelas: { select: { nama: true } } } },
    },
    orderBy: { tanggal: "desc" },
  });

  // Statistik bulan berjalan
  const now = new Date();
  const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);
  const bulanIni = rows.filter((r) => new Date(r.tanggal) >= awalBulan);
  const statistik = {
    positif: bulanIni.filter((r) => r.jenisSikap === "POSITIF").length,
    pelanggaran: bulanIni.filter((r) => r.jenisSikap === "PELANGGARAN").length,
  };

  return {
    guru: {
      nama: guru?.user.name ?? "Guru",
      nip: guru?.nip ?? "-",
      mapel: guru?.mapel ?? "-",
    },
    tahunAjaran: tahunAktif
      ? { nama: tahunAktif.nama, semester: tahunAktif.semester }
      : null,
    kelasList,
    statistik,
    rows: rows.map((r) => ({
      id: r.id,
      tanggal: r.tanggal,
      jenisSikap: r.jenisSikap,
      kategori: r.kategori,
      keterangan: r.keterangan,
      siswaNama: r.siswa.nama,
      siswaNis: r.siswa.nis,
      kelasId: r.siswa.kelasId,
      kelasNama: r.siswa.kelas.nama,
    })),
  };
}

/** Daftar siswa di kelas yang diajar guru — untuk dropdown pencarian di form. */
export async function getSiswaUntukSikap() {
  const guruId = await getGuruId();
  if (!guruId) return [];
  const kelasIds = await kelasIdsGuru(guruId);

  const siswa = await prisma.siswa.findMany({
    where: { status: true, kelasId: { in: kelasIds } },
    select: { id: true, nis: true, nama: true, kelas: { select: { nama: true } } },
    orderBy: { nama: "asc" },
  });
  return siswa.map((s) => ({
    id: s.id, nis: s.nis, nama: s.nama, kelasNama: s.kelas.nama,
  }));
}

/** Ambil satu catatan untuk mode edit. */
export async function getSikapById(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return null;
  const s = await prisma.sikap.findUnique({
    where: { id },
    include: { siswa: { select: { id: true, nis: true, nama: true, kelas: { select: { nama: true } } } } },
  });
  if (!s || s.guruId !== guruId) return null;
  return {
    id: s.id,
    siswaId: s.siswaId,
    siswaLabel: `${s.siswa.nama} - ${s.siswa.nis} - ${s.siswa.kelas.nama}`,
    jenisSikap: s.jenisSikap,
    kategori: s.kategori,
    keterangan: s.keterangan,
    tanggal: s.tanggal,
  };
}

async function konteksSemester() {
  const ta = await prisma.tahunAjaran.findFirst({ where: { aktif: true } });
  return {
    semester: (ta?.semester ?? "GANJIL") as Semester,
    tahunAjar: ta?.nama ?? "",
  };
}

export async function createSikap(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const parsed = sikapSchema.safeParse({
    siswaId: formData.get("siswaId"),
    jenisSikap: formData.get("jenisSikap"),
    kategori: formData.get("kategori"),
    keterangan: (formData.get("keterangan") as string)?.trim(),
    tanggal: formData.get("tanggal"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Pastikan siswa memang di kelas yang diajar guru
  const kelasIds = await kelasIdsGuru(guruId);
  const siswa = await prisma.siswa.findUnique({
    where: { id: parsed.data.siswaId },
    select: { kelasId: true },
  });
  if (!siswa || !kelasIds.includes(siswa.kelasId)) {
    return { success: false, message: "Siswa bukan dari kelas yang Anda ajar" };
  }

  const { semester, tahunAjar } = await konteksSemester();

  await prisma.sikap.create({
    data: {
      siswaId: parsed.data.siswaId,
      guruId,
      tanggal: parsed.data.tanggal,
      jenisSikap: parsed.data.jenisSikap as JenisSikap,
      kategori: parsed.data.kategori,
      keterangan: parsed.data.keterangan,
      semester,
      tahunAjar,
    },
  });

  revalidatePath("/guru/sikap");
  return { success: true, message: "Catatan sikap berhasil disimpan" };
}

export async function updateSikap(id: number, formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const milik = await prisma.sikap.findUnique({ where: { id }, select: { guruId: true } });
  if (!milik) return { success: false, message: "Data tidak ditemukan" };
  if (milik.guruId !== guruId) return { success: false, message: "Bukan data Anda" };

  const parsed = sikapSchema.safeParse({
    siswaId: formData.get("siswaId"),
    jenisSikap: formData.get("jenisSikap"),
    kategori: formData.get("kategori"),
    keterangan: (formData.get("keterangan") as string)?.trim(),
    tanggal: formData.get("tanggal"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  await prisma.sikap.update({
    where: { id },
    data: {
      siswaId: parsed.data.siswaId,
      tanggal: parsed.data.tanggal,
      jenisSikap: parsed.data.jenisSikap as JenisSikap,
      kategori: parsed.data.kategori,
      keterangan: parsed.data.keterangan,
    },
  });

  revalidatePath("/guru/sikap");
  return { success: true, message: "Catatan sikap berhasil diperbarui" };
}

export async function deleteSikap(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const milik = await prisma.sikap.findUnique({ where: { id }, select: { guruId: true } });
  if (!milik) return { success: false, message: "Data tidak ditemukan" };
  if (milik.guruId !== guruId) return { success: false, message: "Bukan data Anda" };

  await prisma.sikap.delete({ where: { id } });
  revalidatePath("/guru/sikap");
  return { success: true, message: "Catatan sikap berhasil dihapus" };
}

export type SikapRow = NonNullable<
  Awaited<ReturnType<typeof getDataHalamanSikap>>
>["rows"][number];
export type SiswaOpsi = Awaited<ReturnType<typeof getSiswaUntukSikap>>[number];