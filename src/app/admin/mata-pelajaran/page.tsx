import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import MapelTable from "@/components/admin/mapel/MapelTable";

export default async function MapelPage() {
  const mapel = await prisma.mataPelajaran.findMany({
    include: { _count: { select: { guruMapel: true } } },
    orderBy: { kodeMapel: "asc" },
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">{mapel.length} mata pelajaran</p>
        </div>
        <Link href="/admin/mata-pelajaran/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Mapel
        </Link>
      </div>
      <MapelTable data={mapel} />
    </div>
  );
}