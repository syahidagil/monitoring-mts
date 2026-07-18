"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteJadwal } from "@/actions/jadwal.action";
import ConfirmDeleteDialog from "@/components/admin/shared/ConfirmDeleteDialog";

const HARI_ORDER = ["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
const HARI_COLOR: Record<string, string> = {
  SENIN: "bg-blue-50 text-blue-700",
  SELASA: "bg-purple-50 text-purple-700",
  RABU: "bg-green-50 text-green-700",
  KAMIS: "bg-yellow-50 text-yellow-700",
  JUMAT: "bg-orange-50 text-orange-700",
  SABTU: "bg-pink-50 text-pink-700",
};

export default function JadwalTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sorted = [...data].sort((a, b) => {
    const hi = HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari);
    return hi !== 0 ? hi : a.jamMulai.localeCompare(b.jamMulai);
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteJadwal(deleteTarget.id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setDeleteTarget(null);
      setTimeout(() => setMessage(null), 4000);
    });
  }

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
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Hari</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mata Pelajaran</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Guru</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jam</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Belum ada data jadwal</td></tr>
            )}
            {sorted.map((j, i) => (
              <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${HARI_COLOR[j.hari] ?? "bg-gray-100 text-gray-600"}`}>
                    {j.hari}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-gray-800">Kelas {j.kelas.nama}</p>
                  <p className="text-xs text-gray-400">{j.kelas.tahunAjaran.nama}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">{j.mapel}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{j.guru.user.name}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                    {j.jamMulai} – {j.jamSelesai}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/jadwal/${j.id}/edit`}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => setDeleteTarget({ id: j.id, label: `${j.hari} - ${j.mapel} (${j.kelas.nama})` })}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {data.length} jadwal tersedia
        </div>
      </div>
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Jadwal"
        description={`Hapus jadwal "${deleteTarget?.label}"? Data absensi yang terkait tidak akan terhapus.`}
        isLoading={isPending}
      />
    </>
  );
}