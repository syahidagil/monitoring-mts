import { getDataForJadwalForm } from "@/actions/jadwal.action";
import JadwalForm from "@/components/admin/jadwal/JadwalForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function InputJadwalPage() {
  const { kelas, guru, mapel, tahunAjaran } = await getDataForJadwalForm();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Jadwal</h1>
          <p className="text-sm text-gray-500 mt-1">Manajemen Jadwal</p>
        </div>
        <Link href="/admin/jadwal"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
      <JadwalForm kelas={kelas} guru={guru} mapel={mapel} tahunAjaran={tahunAjaran} />
    </div>
  );
}