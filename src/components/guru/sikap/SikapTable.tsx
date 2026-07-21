"use client";
import { useState, useTransition } from "react";
import { deleteSikap } from "@/actions/guru/sikap.action";
import { Trash2 } from "lucide-react";

const PREDIKAT_COLOR: Record<string, string> = {
  SB:"bg-green-100 text-green-700", B:"bg-blue-100 text-blue-700",
  C:"bg-yellow-100 text-yellow-700", K:"bg-red-100 text-red-700",
};
const PREDIKAT_LABEL: Record<string, string> = {
  SB:"Sangat Baik", B:"Baik", C:"Cukup", K:"Kurang",
};

export default function SikapTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string }|null>(null);

  function handleDelete(id: number) {
    if (!confirm("Hapus catatan sikap ini?")) return;
    startTransition(async () => {
      const result = await deleteSikap(id);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aspek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Predikat</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Belum ada catatan sikap</td></tr>
            )}
            {data.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-gray-800">{s.siswa.nama}</p>
                  <p className="text-xs text-gray-400">Kelas {s.siswa.kelas.nama}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">{s.aspek}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PREDIKAT_COLOR[s.predikat]}`}>
                    {PREDIKAT_LABEL[s.predikat]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500">
                  {new Date(s.tanggal).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button onClick={() => handleDelete(s.id)} disabled={isPending}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}