import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import DeleteButton from "../berita/DeleteButton";

export default async function EskulPage() {
  const eskul = await prisma.informasiSekolah.findMany({
    where: { kategori: "ekstrakurikuler" },
    orderBy: { tanggalUpdate: "desc" },
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Ekstrakurikuler</h1>
          <p className="text-sm text-gray-500 mt-1">{eskul.length} ekstrakurikuler tersedia</p>
        </div>
        <Link href="/admin/ekstrakurikuler/tambah"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Eskul
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jadwal & Pembina</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {eskul.length === 0 && (
              <tr><td colSpan={3} className="text-center py-12 text-gray-400 text-sm">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />Belum ada ekstrakurikuler
              </td></tr>
            )}
            {eskul.map((item) => {
              const [jadwal, pembina] = item.isi.split("|");
              return (
                <tr key={item.idInfo} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.judul}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{jadwal} · {pembina}</td>
                  <td className="px-5 py-4 text-center"><DeleteButton idInfo={item.idInfo} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
