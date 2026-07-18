import { getAllKelas, getAllTahunAjaran } from "@/actions/kelas.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import KelasTable from "@/components/admin/kelas/KelasTable";
import KelasFilter from "@/components/admin/kelas/KelasFilter";

type Props = { searchParams: Promise<{ search?: string; tahunAjaranId?: string; tingkat?: string }> };

export default async function DataKelasPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const tahunAjaranId = params.tahunAjaranId ? Number(params.tahunAjaranId) : undefined;
  const tingkat = params.tingkat ? Number(params.tingkat) : undefined;

  const [allKelas, tahunAjaran] = await Promise.all([getAllKelas(), getAllTahunAjaran()]);

  let data = allKelas;
  if (search) data = data.filter((k) => k.nama.toLowerCase().includes(search.toLowerCase()));
  if (tahunAjaranId) data = data.filter((k) => k.tahunAjaranId === tahunAjaranId);
  if (tingkat) data = data.filter((k) => k.tingkat === tingkat);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} kelas terdaftar</p>
        </div>
        <Link href="/admin/data-kelas/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Kelas
        </Link>
      </div>
      <KelasFilter tahunAjaran={tahunAjaran} />
      <KelasTable data={data} />
    </div>
  );
}