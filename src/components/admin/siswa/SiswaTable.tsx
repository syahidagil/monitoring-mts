"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteSiswa } from "@/actions/siswa.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

type Props = { data: any[]; total: number; totalPages: number; currentPage: number };

export default function SiswaTable({ data, total, totalPages, currentPage }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/data-siswa?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteSiswa(deleteTarget.id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setDeleteTarget(null);
      setTimeout(() => setMessage(null), 4000);
    });
  }

  const startNo = (currentPage - 1) * 10 + 1;

  return (
    <>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase w-12">No</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">NIS</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Siswa</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jenis Kelamin</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status Tahfidz</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Belum ada data siswa</td></tr>
            )}
            {data.map((siswa, i) => (
              <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-sm text-gray-400">{startNo + i}</td>
                <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{siswa.nis}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-700">{siswa.nama.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{siswa.nama}</p>
                      {siswa.orangTua && <p className="text-xs text-gray-400">{siswa.orangTua.user.name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{siswa.kelas.nama}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${siswa.statusTahfidz ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {siswa.statusTahfidz ? "Aktif" : "Tidak"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/data-siswa/${siswa.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => setDeleteTarget({ id: siswa.id, nama: siswa.nama })}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Menampilkan {startNo}-{Math.min(startNo + 9, total)} dari {total} siswa</p>
            <div className="flex items-center gap-1">
              <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => goPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border transition-colors ${p === currentPage ? "bg-[#1B5E20] text-white border-[#1B5E20]" : "border-gray-200 hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Data Siswa"
        description={`Apakah Anda yakin ingin menghapus data siswa "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isPending}
      />
    </>
  );
}