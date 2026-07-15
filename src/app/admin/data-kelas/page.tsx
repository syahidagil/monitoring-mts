import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import KelasTable from "@/components/admin/kelas/KelasTable";

export default async function DataKelasPage() {
  const kelas = await prisma.kelas.findMany({
    include: {
      tahunAjaran: { select: { nama: true, semester: true } },
      waliKelas: { include: { user: { select: { name: true } } } },
      _count: { select: { siswa: true } },
    },
    orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">{kelas.length} kelas terdaftar</p>
        </div>
        <Link href="/admin/data-kelas/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Kelas
        </Link>
      </div>
      <KelasTable data={kelas} />
    </div>
  );
}