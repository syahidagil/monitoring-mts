import { getAllOrangTua } from "@/actions/orangtua.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import OrangtuaTable from "@/components/admin/orangtua/OrangtuaTable";
import OrangtuaFilter from "@/components/admin/orangtua/OrangtuaFilter";

type Props = { searchParams: Promise<{ search?: string }> };

export default async function DataOrangtuaPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";

  let data = await getAllOrangTua();
  if (search) {
    data = data.filter((o) =>
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Orang Tua</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} orang tua terdaftar</p>
        </div>
        <Link href="/admin/data-orangtua/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Orang Tua
        </Link>
      </div>
      <OrangtuaFilter />
      <OrangtuaTable data={data} />
    </div>
  );
}