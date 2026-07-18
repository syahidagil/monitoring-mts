import { getAllMapel } from "@/actions/mapel.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import MapelTable from "@/components/admin/mapel/MapelTable";
import MapelFilter from "@/components/admin/mapel/MapelFilter";

type Props = { searchParams: Promise<{ search?: string }> };

export default async function MataPelajaranPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";

  let data = await getAllMapel();
  if (search) {
    data = data.filter((m) =>
      m.namaMapel.toLowerCase().includes(search.toLowerCase()) ||
      m.kodeMapel.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} mata pelajaran</p>
        </div>
        <Link href="/admin/mata-pelajaran/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Mapel
        </Link>
      </div>
      <MapelFilter />
      <MapelTable data={data} />
    </div>
  );
}