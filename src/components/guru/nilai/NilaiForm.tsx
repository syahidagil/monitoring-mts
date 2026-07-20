"use client";
import { useState, useTransition } from "react";
import { saveNilaiKelas } from "@/actions/guru/nilai.action";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const JENIS_OPTIONS = ["HARIAN","UTS","UAS","TUGAS","PRAKTIK"];

type Siswa = { id: number; nis: string; nama: string };
type Props = {
  siswaList: Siswa[];
  mapel: string;
  semester: string;
  tahunAjar: string;
  guruId: string;
};

export default function NilaiForm({ siswaList, mapel, semester, tahunAjar, guruId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [jenis, setJenis]   = useState("HARIAN");
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");
  const [nilaiMap, setNilaiMap] = useState<Record<number, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const fd = new FormData();
    fd.set("mapel", mapel); fd.set("jenis", jenis);
    fd.set("semester", semester); fd.set("tahunAjar", tahunAjar);
    fd.set("guruId", guruId);
    Object.entries(nilaiMap).forEach(([id, val]) => { if (val) fd.set(`nilai_${id}`, val); });
    startTransition(async () => {
      const result = await saveNilaiKelas(fd);
      if (result.success) { setSuccess(result.message); setNilaiMap({}); }
      else setError(result.message);
    });
  }

  const avg = Object.values(nilaiMap).filter(Boolean).length > 0
    ? (Object.values(nilaiMap).filter(Boolean).reduce((a, b) => a + Number(b), 0) / Object.values(nilaiMap).filter(Boolean).length).toFixed(1)
    : "-";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Penilaian</label>
          <select value={jenis} onChange={(e) => setJenis(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Rata-rata</p>
          <p className="text-2xl font-bold text-[#1B5E20]">{avg}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10">No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">NIS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Siswa</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-32">Nilai (0-100)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {siswaList.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.nis}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.nama}</td>
                <td className="px-4 py-3">
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={nilaiMap[s.id] ?? ""}
                    onChange={(e) => setNilaiMap((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Nilai</>}
        </button>
      </div>
    </form>
  );
}