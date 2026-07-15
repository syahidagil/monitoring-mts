import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, Trash2, Download } from "lucide-react";
import DeletePmbmButton from "./DeletePmbmButton";

export default async function AdminPmbmPage() {
  const pengumuman = await prisma.pengumumanPmbm.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pengumuman PMBM</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola file pengumuman penerimaan murid baru</p>
        </div>
        <Link href="/admin/pmbm/tambah"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Upload Pengumuman
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Judul</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahun</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">File</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Diupload</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pengumuman.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada pengumuman diupload
                </td>
              </tr>
            )}
            {pengumuman.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-800">{item.judul}</p>
                  {item.deskripsi && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    {item.tahun}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <a href={item.filePath} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-32">{item.fileName}</span>
                  </a>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                  <br />
                  <span className="text-gray-400">{item.admin.name}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <a href={item.filePath} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </a>
                    <DeletePmbmButton id={item.id} />
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
