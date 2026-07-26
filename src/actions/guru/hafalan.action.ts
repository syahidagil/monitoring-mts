"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hafalanSchema } from "@/lib/validations/guru/hafalan.validation";
import { Hari } from "@prisma/client";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

function hariDari(tanggal: Date): Hari {
  const tabel: Record<number, Hari> = {
    0: Hari.SABTU, 1: Hari.SENIN, 2: Hari.SELASA, 3: Hari.RABU,
    4: Hari.KAMIS, 5: Hari.JUMAT, 6: Hari.SABTU,
  };
  return tabel[tanggal.getDay()] ?? Hari.SENIN;
}

export async function createHafalan(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const raw = {
    siswaId:    Number(formData.get("siswaId")),
    nomorSurat: Number(formData.get("nomorSurat")),
    surat:      (formData.get("surat") as string)?.trim(),
    juz:        Number(formData.get("juz")),
    halaman:    Number(formData.get("halaman")),
    nilai:      formData.get("nilai") as string,
    keterangan: (formData.get("keterangan") as string)?.trim() || "",
  };

  const parsed = hafalanSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const tanggal = new Date();
  await prisma.hafalan.create({
    data: {
      siswaId:    parsed.data.siswaId,
      guruId,
      hari:       hariDari(tanggal),
      tanggal,
      juz:        parsed.data.juz,
      surat:      parsed.data.surat,
      halaman:    parsed.data.halaman,
      nilai:      parsed.data.nilai,
      keterangan: parsed.data.keterangan || null,
    },
  });

  revalidatePath("/guru/hafalan");
  revalidatePath(`/guru/hafalan/${parsed.data.siswaId}`);
  return { success: true, message: "Data hafalan berhasil disimpan" };
}

export async function getHafalanBySiswa(siswaId: number) {
  return prisma.hafalan.findMany({
    where: { siswaId },
    orderBy: { tanggal: "desc" },
  });
}

export async function getSiswaTahfidz(guruId?: string) {
  const session = await auth();
  const gId = guruId ?? session?.user?.id;
  if (!gId) return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId: gId },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.siswa.findMany({
    where: { statusTahfidz: true, kelasId: { in: kelasIds } },
    include: {
      kelas: { select: { nama: true } },
      hafalan: { orderBy: { tanggal: "desc" }, take: 1 },
      _count: { select: { hafalan: true } },
    },
    orderBy: { nama: "asc" },
  });
}

export async function deleteHafalan(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const data = await prisma.hafalan.findUnique({
    where: { id },
    select: { siswaId: true, guruId: true },
  });
  if (!data) return { success: false, message: "Data tidak ditemukan" };
  if (data.guruId !== guruId) {
    return { success: false, message: "Anda tidak berhak menghapus data ini" };
  }

  await prisma.hafalan.delete({ where: { id } });
  revalidatePath("/guru/hafalan");
  revalidatePath(`/guru/hafalan/${data.siswaId}`);
  return { success: true, message: "Data hafalan berhasil dihapus" };
}

/**
 * Data lengkap untuk HALAMAN PEMILIHAN SANTRI TAHFIDZ.
 * Mengembalikan: profil guru (nama, NIP), tahun ajaran aktif,
 * daftar kelas yang diajar, dan seluruh santri tahfidz beserta
 * capaian terakhirnya (juz + halaman dari setoran terbaru).
 */
export async function getDataHalamanTahfidz() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  const guruId = session.user.id;

  const [guru, tahunAktif, jadwal] = await Promise.all([
    prisma.guru.findUnique({
      where: { id: guruId },
      include: { user: { select: { name: true } } },
    }),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
    prisma.jadwal.findMany({
      where: { guruId },
      select: { kelas: { select: { id: true, nama: true } } },
      distinct: ["kelasId"],
      orderBy: { kelas: { nama: "asc" } },
    }),
  ]);

  const kelasList = jadwal.map((j) => j.kelas);
  const kelasIds = kelasList.map((k) => k.id);

  const santri = await prisma.siswa.findMany({
    where: { statusTahfidz: true, status: true, kelasId: { in: kelasIds } },
    include: {
      kelas: { select: { id: true, nama: true } },
      hafalan: {
        orderBy: { tanggal: "desc" },
        take: 1,
        select: { juz: true, halaman: true, surat: true, tanggal: true },
      },
      _count: { select: { hafalan: true } },
    },
    orderBy: { nama: "asc" },
  });

  return {
    guru: {
      nama: guru?.user.name ?? "Guru",
      nip: guru?.nip ?? "-",
    },
    tahunAjaran: tahunAktif
      ? { nama: tahunAktif.nama, semester: tahunAktif.semester }
      : null,
    kelasList,
    santri: santri.map((s) => {
      const terakhir = s.hafalan[0];
      return {
        id: s.id,
        nis: s.nis,
        nama: s.nama,
        kelasId: s.kelas.id,
        kelasNama: s.kelas.nama,
        totalSetoran: s._count.hafalan,
        juzTerakhir: terakhir?.juz ?? null,
        halamanTerakhir: terakhir?.halaman ?? null,
        suratTerakhir: terakhir?.surat ?? null,
        tanggalTerakhir: terakhir?.tanggal ?? null,
      };
    }),
  };
}

export type SantriTahfidz = NonNullable<
  Awaited<ReturnType<typeof getDataHalamanTahfidz>>
>["santri"][number];
export type KelasRingkas = { id: number; nama: string };