"use client";
import { useState, useTransition } from "react";
import { saveAbsensiKelas } from "@/actions/guru/absensi.action";
import { CheckCircle, AlertCircle, Save } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "HADIR", label: "H", color: "bg-green-100 text-green-700 border-green-300",  selected: "bg-green-600 text-white border-green-600" },
  { value: "SAKIT", label: "S", color: "bg-blue-100 text-blue-700 border-blue-300",    selected: "bg-blue-600 text-white border-blue-600" },
  { value: "IZIN",  label: "I", color: "bg-yellow-100 text-yellow-700 border-yellow-300", selected: "bg-yellow-500 text-white border-yellow-500" },
  { value: "ALPHA", label: "A", color: "bg-red-100 text-red-700 border-red-300",       selected: "bg-red-600 text-white border-red-600" },
];

type Siswa = { id: number; nis: string; nama: string };

type Props = {
  jadwalId: number;
  tanggal: string;
  siswaList: Siswa[];
  existingAbsensi?: { siswaId: number; status: string }[];
};

export default function AbsensiForm({ jadwalId, tanggal, siswaList, existingAbsensi = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError]   = useState("");
  const [statuses, setStatuses] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    siswaList.forEach((s) => {
      const ex = existingAbsensi.find((e) => e.siswaId === s.id);
      init[s.id] = ex?.status ?? "HADIR";
    });
    return init;
  });

  function setAllHadir() {
    const next: Record<number, string> = {};
    siswaList.forEach((s) => { next[s.id] = "HADIR"; });
    setStatuses(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const fd = new FormData();
    fd.set("jadwalId", String(jadwalId));
    fd.set("tanggal", tanggal);
    Object.entries(statuses).forEach(([siswaId, status]) => {
      fd.set(`status_${siswaId}`, status);
    });
    startTransition(async () => {
      const result = await saveAbsensiKelas(fd);
      if (result.success) setSuccess(result.message);
      else setError(result.message);
    });
  }

  const rekap = Object.values(statuses).reduce((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

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

      {/* Rekap cepat */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-3 flex-1 flex-wrap">
          {["HADIR","SAKIT","IZIN","ALPHA"].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                s === "HADIR" ? "bg-green-100 text-green-700" :
                s === "SAKIT" ? "bg-blue-100 text-blue-700"  :
                s === "IZIN"  ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>{s[0]}</span>
              <span className="text-xs text-gray-600 font-semibold">{rekap[s] ?? 0}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={setAllHadir}
          className="text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
          Semua Hadir
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10">No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">NIS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Siswa</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {siswaList.map((siswa, i) => (
              <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{siswa.nis}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{siswa.nama}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatuses((prev) => ({ ...prev, [siswa.id]: opt.value }))}
                        className={`w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all ${
                          statuses[siswa.id] === opt.value ? opt.selected : opt.color
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Absensi</>}
        </button>
      </div>
    </form>
  );
}