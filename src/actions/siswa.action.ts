"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { JenisKelamin } from "@prisma/client";

export async function createSiswa(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nis = (formData.get("nis") as string)?.trim();
  const nama = (formData.get("nama") as string)?.trim();
  const jenisKelaminRaw = formData.get("jenisKelamin") as string;
  const tempatLahir = (formData.get("tempatLahir") as string)?.trim() || null;
  const tanggalLahirRaw = formData.get("tanggalLahir") as string;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const namaAyah = (formData.get("namaAyah") as string)?.trim() || null;
  const namaIbu = (formData.get("namaIbu") as string)?.trim() || null;
  const kelasId = Number(formData.get("kelasId"));
  const orangTuaId = (formData.get("orangTuaId") as string) || null;
  const statusTahfidz = formData.get("statusTahfidz") === "true";
  const status = formData.get("status") !== "false";

  if (!nis) return { success: false, message: "NIS wajib diisi" };
  if (!nama) return { success: false, message: "Nama wajib diisi" };
  if (!tanggalLahirRaw) return { success: false, message: "Tanggal lahir wajib diisi" };
  if (!kelasId) return { success: false, message: "Kelas wajib dipilih" };

  const jenisKelamin: JenisKelamin =
    jenisKelaminRaw === "Perempuan" || jenisKelaminRaw === "P" ? "P" : "L";

  const nisExists = await prisma.siswa.findUnique({ where: { nis } });
  if (nisExists) return { success: false, message: "NIS sudah terdaftar" };

  await prisma.siswa.create({
    data: {
      nis, nama, jenisKelamin,
      tempatLahir, tanggalLahir: new Date(tanggalLahirRaw),
      alamat, namaAyah, namaIbu,
      kelasId, orangTuaId, statusTahfidz, status,
    },
  });

  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Siswa berhasil ditambahkan" };
}

export async function getAllSiswa(params?: {
  search?: string;
  kelasId?: number;
  statusTahfidz?: boolean;
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.search) {
    where.OR = [
      { nama: { contains: params.search } },
      { nis: { contains: params.search } },
    ];
  }
  if (params?.kelasId) where.kelasId = params.kelasId;
  if (params?.statusTahfidz !== undefined) where.statusTahfidz = params.statusTahfidz;

  const [data, total] = await Promise.all([
    prisma.siswa.findMany({
      where, skip, take: limit,
      include: {
        kelas: { include: { tahunAjaran: { select: { nama: true } } } },
        orangTua: { include: { user: { select: { name: true } } } },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.siswa.count({ where }),
  ]);

  return { data, total, totalPages: Math.ceil(total / limit), page };
}

export async function getSiswaById(id: number) {
  return prisma.siswa.findUnique({
    where: { id },
    include: {
      kelas: { include: { tahunAjaran: true } },
      orangTua: { include: { user: { select: { name: true, username: true } } } },
    },
  });
}

export async function updateSiswa(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const nis = (formData.get("nis") as string)?.trim();
  const nama = (formData.get("nama") as string)?.trim();
  const jenisKelaminRaw = formData.get("jenisKelamin") as string;
  const tempatLahir = (formData.get("tempatLahir") as string)?.trim() || null;
  const tanggalLahirRaw = formData.get("tanggalLahir") as string;
  const alamat = (formData.get("alamat") as string)?.trim() || null;
  const namaAyah = (formData.get("namaAyah") as string)?.trim() || null;
  const namaIbu = (formData.get("namaIbu") as string)?.trim() || null;
  const kelasId = Number(formData.get("kelasId"));
  const orangTuaId = (formData.get("orangTuaId") as string) || null;
  const statusTahfidz = formData.get("statusTahfidz") === "true";
  const status = formData.get("status") !== "false";

  if (!nama) return { success: false, message: "Nama wajib diisi" };
  if (!kelasId) return { success: false, message: "Kelas wajib dipilih" };

  const jenisKelamin: JenisKelamin =
    jenisKelaminRaw === "Perempuan" || jenisKelaminRaw === "P" ? "P" : "L";

  if (nis) {
    const nisExists = await prisma.siswa.findFirst({ where: { nis, NOT: { id } } });
    if (nisExists) return { success: false, message: "NIS sudah digunakan siswa lain" };
  }

  await prisma.siswa.update({
    where: { id },
    data: {
      nis, nama, jenisKelamin,
      tempatLahir, tanggalLahir: new Date(tanggalLahirRaw),
      alamat, namaAyah, namaIbu,
      kelasId, orangTuaId, statusTahfidz, status,
    },
  });

  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Data siswa berhasil diperbarui" };
}

export async function deleteSiswa(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return { success: false, message: "Tidak diizinkan" };

  const siswa = await prisma.siswa.findUnique({
    where: { id },
    include: {
      _count: {
        select: { absensi: true, nilai: true, sikap: true, hafalan: true, tahsin: true },
      },
    },
  });
  if (!siswa) return { success: false, message: "Siswa tidak ditemukan" };

  const { absensi, nilai, sikap, hafalan, tahsin } = siswa._count;
  if (absensi > 0) return { success: false, message: `Siswa memiliki ${absensi} data absensi. Hapus data monitoring terlebih dahulu.` };
  if (nilai > 0) return { success: false, message: `Siswa memiliki ${nilai} data nilai.` };
  if (sikap > 0) return { success: false, message: `Siswa memiliki ${sikap} data penilaian sikap.` };
  if (hafalan > 0) return { success: false, message: `Siswa memiliki ${hafalan} data hafalan.` };
  if (tahsin > 0) return { success: false, message: `Siswa memiliki ${tahsin} data tahsin.` };

  await prisma.siswa.delete({ where: { id } });
  revalidatePath("/admin/data-siswa");
  return { success: true, message: "Siswa berhasil dihapus" };
}

export async function searchSiswaForSelect(query: string) {
  const siswa = await prisma.siswa.findMany({
    where: {
      OR: [
        { nama: { contains: query } },
        { nis: { contains: query } },
      ],
    },
    include: { kelas: { select: { nama: true } } },
    take: 10,
    orderBy: { nama: "asc" },
  });

  return siswa.map((s) => ({
    id: s.id,
    nis: s.nis,
    nama: s.nama,
    kelasNama: s.kelas.nama,
  }));
}