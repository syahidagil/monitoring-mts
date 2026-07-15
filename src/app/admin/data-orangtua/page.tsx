import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import OrangtuaTable from "@/components/admin/orangtua/OrangtuaTable";

export default async function DataOrangtuaPage() {
  const orangtua = await prisma.orangTua.findMany({
    include: {
      user: { select: { name: true, username: true, status: true } },
      anak: { select: { id: true, nama: true, nis: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Orang Tua</h1>
          <p className="text-sm text-gray-500 mt-1">{orangtua.length} orang tua terdaftar</p>
        </div>
        <Link href="/admin/data-orangtua/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Orang Tua
        </Link>
      </div>
      <OrangtuaTable data={orangtua} />
    </div>
  );
}