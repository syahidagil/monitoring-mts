import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Newspaper } from "lucide-react";
import DeleteButton from "./DeleteButton";

export default async function BeritaPage() {
  const berita = await prisma.informasiSekolah.findMany({
    where: { kategori: "berita" },
    orderBy: { tanggalUpdate: "desc" },
    include: { admin: { select: { name: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-sm text-gray-500 mt-1">{berita.length} berita tersedia</p>
        </div>
        <Link href="/admin/berita/tambah"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Berita
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Penulis</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {berita.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                  <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada berita
                </td>
              </tr>
            )}
            {berita.map((item) => (
              <tr key={item.idInfo} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{item.judul}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.isi.substring(0, 60)}...</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{item.admin.name}</td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {new Date(item.tanggalUpdate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/berita/${item.idInfo}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <DeleteButton idInfo={item.idInfo} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
