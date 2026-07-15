import { prisma } from "@/lib/prisma";
import KelasForm from "@/components/admin/kelas/KelasForm";

export default async function InputKelasPage() {
  const [tahunAjaran, guru] = await Promise.all([
    prisma.tahunAjaran.findMany({ orderBy: { nama: "desc" } }),
    prisma.guru.findMany({ include: { user: { select: { name: true } } }, orderBy: { user: { name: "asc" } } }),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Kelas Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Buat kelas baru untuk tahun ajaran aktif</p>
      </div>
      <KelasForm tahunAjaran={tahunAjaran} guru={guru} />
    </div>
  );
}