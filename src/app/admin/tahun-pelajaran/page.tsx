import { getAllTahunAjaran } from "@/actions/tahunAjaran.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import TahunPelajaranTable from "@/components/admin/tahun-pelajaran/TahunPelajaranTable";

export default async function TahunPelajaranPage() {
  const data = await getAllTahunAjaran();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tahun Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">{data.length} tahun ajaran terdaftar</p>
        </div>
        <Link href="/admin/tahun-pelajaran/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
        </Link>
      </div>
      <TahunPelajaranTable data={data} />
    </div>
  );
}