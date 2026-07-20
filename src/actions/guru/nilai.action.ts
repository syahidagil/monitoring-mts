"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getGuruId() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") return null;
  return session.user.id;
}

// Simpan nilai seluruh kelas sekaligus
export async function saveNilaiKelas(formData: FormData) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };

  const mapel     = formData.get("mapel") as string;
  const jenis     = formData.get("jenis") as string;
  const semester  = formData.get("semester") as string;
  const tahunAjar = formData.get("tahunAjar") as string;

  if (!mapel || !jenis || !semester || !tahunAjar)
    return { success: false, message: "Data tidak lengkap" };

  const entries: { siswaId: number; nilai: number; keterangan?: string }[] = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("nilai_")) {
      const siswaId = Number(key.replace("nilai_", ""));
      const nilaiNum = Number(val);
      if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) continue;
      const ket = formData.get(`ket_${siswaId}`) as string || undefined;
      entries.push({ siswaId, nilai: nilaiNum, keterangan: ket });
    }
  }

  if (entries.length === 0) return { success: false, message: "Tidak ada nilai yang diinput" };

  await prisma.nilai.createMany({
    data: entries.map((e) => ({
      siswaId: e.siswaId,
      guruId,
      mapel,
      jenis: jenis as any,
      nilai: e.nilai,
      semester: semester as any,
      tahunAjar,
      keterangan: e.keterangan,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/guru/nilai");
  return { success: true, message: `Nilai ${entries.length} siswa berhasil disimpan` };
}

// Ambil nilai siswa per kelas & mapel
export async function getNilaiByKelasMapel(kelasId: number, mapel: string, semester: string, tahunAjar: string) {
  return prisma.nilai.findMany({
    where: { siswa: { kelasId }, mapel, semester: semester as any, tahunAjar },
    include: { siswa: { select: { id: true, nis: true, nama: true } } },
    orderBy: { siswa: { nama: "asc" } },
  });
}

// Hapus nilai
export async function deleteNilai(id: number) {
  const guruId = await getGuruId();
  if (!guruId) return { success: false, message: "Tidak diizinkan" };
  await prisma.nilai.delete({ where: { id } });
  revalidatePath("/guru/nilai");
  return { success: true, message: "Nilai berhasil dihapus" };
}