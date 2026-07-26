"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { tahsinSchema } from "@/lib/validations/guru/tahsin.validation";
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

export async function createTahsin(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const raw = {
    siswaId:    Number(formData.get("siswaId")),
    nomorSurat: Number(formData.get("nomorSurat")),
    surat:      (formData.get("surat") as string)?.trim(),
    juz:        Number(formData.get("juz")),
    halaman:    Number(formData.get("halaman")),
    tajwid:     formData.get("tajwid") as string,
    makhraj:    formData.get("makhraj") as string,
    sifatul:    formData.get("sifatul") as string,
    tanggal:    formData.get("tanggal") as string,
    keterangan: (formData.get("keterangan") as string)?.trim() || "",
  };

  const parsed = tahsinSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Guru penguji = guru yang login (dari session), bukan dari input.
  await prisma.tahsin.create({
    data: {
      siswaId:    parsed.data.siswaId,
      guruId,
      hari:       hariDari(parsed.data.tanggal),
      tanggal:    parsed.data.tanggal,
      juz:        parsed.data.juz,
      surat:      parsed.data.surat,
      halaman:    parsed.data.halaman,
      tajwid:     parsed.data.tajwid,
      makhraj:    parsed.data.makhraj,
      sifatul:    parsed.data.sifatul,
      keterangan: parsed.data.keterangan || null,
    },
  });

  revalidatePath("/guru/tahsin");
  revalidatePath(`/guru/tahsin/${parsed.data.siswaId}`);
  return { success: true, message: "Data tahsin berhasil disimpan" };
}

export async function getTahsinBySiswa(siswaId: number) {
  return prisma.tahsin.findMany({
    where: { siswaId },
    orderBy: { tanggal: "desc" },
  });
}

export async function getSiswaForTahsin() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return [];

  const jadwal = await prisma.jadwal.findMany({
    where: { guruId: session.user.id },
    select: { kelasId: true },
    distinct: ["kelasId"],
  });
  const kelasIds = jadwal.map((j) => j.kelasId);

  return prisma.siswa.findMany({
    where: { kelasId: { in: kelasIds }, status: true, statusTahfidz: false },
    include: {
      kelas: { select: { nama: true } },
      tahsin: { orderBy: { tanggal: "desc" }, take: 1 },
      _count: { select: { tahsin: true } },
    },
    orderBy: { nama: "asc" },
  });
}

export async function deleteTahsin(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const data = await prisma.tahsin.findUnique({
    where: { id },
    select: { siswaId: true, guruId: true },
  });
  if (!data) return { success: false, message: "Data tidak ditemukan" };
  if (data.guruId !== guruId) {
    return { success: false, message: "Anda tidak berhak menghapus data ini" };
  }

  await prisma.tahsin.delete({ where: { id } });
  revalidatePath("/guru/tahsin");
  revalidatePath(`/guru/tahsin/${data.siswaId}`);
  return { success: true, message: "Data tahsin berhasil dihapus" };
}

export async function getDataHalamanTahsin() {
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

  const siswa = await prisma.siswa.findMany({
    where: { statusTahfidz: false, status: true, kelasId: { in: kelasIds } },
    include: {
      kelas: { select: { id: true, nama: true } },
      tahsin: {
        orderBy: { tanggal: "desc" },
        take: 1,
        select: { juz: true, halaman: true, surat: true, tanggal: true },
      },
      _count: { select: { tahsin: true } },
    },
    orderBy: { nama: "asc" },
  });

  return {
    guru: { nama: guru?.user.name ?? "Guru", nip: guru?.nip ?? "-" },
    tahunAjaran: tahunAktif
      ? { nama: tahunAktif.nama, semester: tahunAktif.semester }
      : null,
    kelasList,
    siswa: siswa.map((s) => {
      const terakhir = s.tahsin[0];
      return {
        id: s.id, nis: s.nis, nama: s.nama,
        kelasId: s.kelas.id, kelasNama: s.kelas.nama,
        totalSetoran: s._count.tahsin,
        juzTerakhir: terakhir?.juz ?? null,
        halamanTerakhir: terakhir?.halaman ?? null,
        suratTerakhir: terakhir?.surat ?? null,
        tanggalTerakhir: terakhir?.tanggal ?? null,
      };
    }),
  };
}

export type SiswaTahsin = NonNullable<
  Awaited<ReturnType<typeof getDataHalamanTahsin>>
>["siswa"][number];
export type KelasRingkas = { id: number; nama: string };