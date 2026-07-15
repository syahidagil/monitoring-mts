import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SiswaForm from "@/components/admin/siswa/SiswaForm";

export default async function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [siswa, kelas, orangtua] = await Promise.all([
    prisma.siswa.findUnique({ where: { id: Number(id) } }),
    prisma.kelas.findMany({ orderBy: [{ tingkat: "asc" }, { nama: "asc" }] }),
    prisma.orangTua.findMany({ include: { user: { select: { name: true } } }, orderBy: { user: { name: "asc" } } }),
  ]);

  if (!siswa) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Data Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data siswa: {siswa.nama}</p>
      </div>
      <SiswaForm kelas={kelas} orangtua={orangtua} defaultValues={siswa} isEdit siswaId={siswa.id} />
    </div>
  );
}