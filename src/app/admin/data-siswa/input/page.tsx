import { prisma } from "@/lib/prisma";
import SiswaForm from "@/components/admin/siswa/SiswaForm";

export default async function InputSiswaPage() {
  const [kelas, orangtua] = await Promise.all([
    prisma.kelas.findMany({ orderBy: [{ tingkat: "asc" }, { nama: "asc" }] }),
    prisma.orangTua.findMany({ include: { user: { select: { name: true } } }, orderBy: { user: { name: "asc" } } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Siswa Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Isi form berikut untuk menambahkan data siswa baru</p>
      </div>
      <SiswaForm kelas={kelas} orangtua={orangtua} />
    </div>
  );
}