"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper: ambil guruId dari session
async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

// Simpan absensi seluruh kelas sekaligus
export async function saveAbsensiKelas(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const jadwalId = Number(formData.get("jadwalId"));
  const tanggal  = formData.get("tanggal") as string;
  if (!jadwalId || !tanggal) return { success: false, message: "Data tidak lengkap" };

  // Ambil semua siswaId dari form (format: status_[siswaId])
  const entries: { siswaId: number; status: string; keterangan?: string }[] = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("status_")) {
      const siswaId = Number(key.replace("status_", ""));
      const keterangan = formData.get(`ket_${siswaId}`) as string || undefined;
      entries.push({ siswaId, status: val as string, keterangan });
    }
  }

  if (entries.length === 0) return { success: false, message: "Tidak ada data siswa" };

  // Upsert semua absensi
  await Promise.all(
    entries.map((e) =>
      prisma.absensi.upsert({
        where: {
          siswaId_jadwalId_tanggal: {
            siswaId: e.siswaId,
            jadwalId,
            tanggal: new Date(tanggal),
          },
        },
        update: { status: e.status as any, keterangan: e.keterangan },
        create: {
          siswaId: e.siswaId,
          jadwalId,
          guruId,
          tanggal: new Date(tanggal),
          status: e.status as any,
          keterangan: e.keterangan,
        },
      })
    )
  );

  revalidatePath("/guru/absensi");
  return { success: true, message: `Absensi ${entries.length} siswa berhasil disimpan` };
}

// Rekap absensi siswa per jadwal
export async function getRekapAbsensi(jadwalId: number, bulan?: number, tahun?: number) {
  const where: any = { jadwalId };
  if (bulan && tahun) {
    const start = new Date(tahun, bulan - 1, 1);
    const end   = new Date(tahun, bulan, 0, 23, 59, 59);
    where.tanggal = { gte: start, lte: end };
  }
  return prisma.absensi.findMany({
    where,
    include: { siswa: { select: { nis: true, nama: true } } },
    orderBy: [{ tanggal: "desc" }, { siswa: { nama: "asc" } }],
  });
}

// Cek absensi sudah ada di tanggal tertentu
export async function getAbsensiByJadwalTanggal(jadwalId: number, tanggal: string) {
  return prisma.absensi.findMany({
    where: { jadwalId, tanggal: new Date(tanggal) },
    include: { siswa: { select: { id: true, nis: true, nama: true } } },
  });
}