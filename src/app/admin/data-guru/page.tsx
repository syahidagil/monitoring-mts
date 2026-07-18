import { getAllGuru } from "@/actions/guru.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import GuruTable from "@/components/admin/guru/GuruTable";
import GuruFilter from "@/components/admin/guru/GuruFilter";

type Props = { searchParams: Promise<{ search?: string; status?: string }> };

export default async function DataGuruPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status;

  let data = await getAllGuru();

  if (search) {
    data = data.filter((g) =>
      g.user.name.toLowerCase().includes(search.toLowerCase()) ||
      g.user.username.toLowerCase().includes(search.toLowerCase()) ||
      (g.nip && g.nip.includes(search))
    );
  }
  if (status === "aktif") data = data.filter((g) => g.user.status);
  if (status === "nonaktif") data = data.filter((g) => !g.user.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Guru</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} guru terdaftar</p>
        </div>
        <Link href="/admin/data-guru/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Guru
        </Link>
      </div>
      <GuruFilter />
      <GuruTable data={data} />
    </div>
  );
}