import { getAllSiswa } from "@/actions/siswa.action";
import { getAllKelas } from "@/actions/kelas.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import SiswaTable from "@/components/admin/siswa/SiswaTable";
import SiswaFilter from "@/components/admin/siswa/SiswaFilter";

type Props = { searchParams: Promise<{ search?: string; kelasId?: string; statusTahfidz?: string; page?: string }> };

export default async function DataSiswaPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const statusTahfidz = params.statusTahfidz === "true" ? true : params.statusTahfidz === "false" ? false : undefined;
  const page = params.page ? Number(params.page) : 1;

  const [result, kelasList] = await Promise.all([
    getAllSiswa({ search, kelasId, statusTahfidz, page, limit: 10 }),
    getAllKelas(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Total {result.total} siswa terdaftar</p>
        </div>
        <Link href="/admin/data-siswa/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Siswa
        </Link>
      </div>
      <SiswaFilter kelas={kelasList} />
      <SiswaTable data={result.data} total={result.total} totalPages={result.totalPages} currentPage={page} />
    </div>
  );
}