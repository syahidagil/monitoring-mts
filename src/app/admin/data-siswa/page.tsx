import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import SiswaTable from "@/components/admin/siswa/SiswaTable";

export default async function DataSiswaPage() {
  const siswa = await prisma.siswa.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kelas: { select: { nama: true } },
      orangTua: { include: { user: { select: { name: true } } } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">{siswa.length} siswa terdaftar</p>
        </div>
        <Link href="/admin/data-siswa/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Siswa
        </Link>
      </div>
      <SiswaTable data={siswa} />
    </div>
  );
}