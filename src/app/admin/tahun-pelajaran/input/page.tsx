import TahunPelajaranForm from "@/components/admin/tahun-pelajaran/TahunPelajaranForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InputTahunPelajaranPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tambah Tahun Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi detail untuk menambahkan rentang tahun akademik baru.
          </p>
        </div>
        <Link href="/admin/tahun-pelajaran"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
      <TahunPelajaranForm />
    </div>
  );
}