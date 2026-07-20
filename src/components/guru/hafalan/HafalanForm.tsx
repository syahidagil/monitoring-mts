"use client";
import { useState, useTransition } from "react";
import { createHafalan } from "@/actions/guru/hafalan.action";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "BELUM",     label: "Belum",     color: "bg-gray-100 text-gray-600"   },
  { value: "PROSES",    label: "Proses",    color: "bg-blue-100 text-blue-700"   },
  { value: "LULUS",     label: "Lulus",     color: "bg-green-100 text-green-700" },
  { value: "MENGULANG", label: "Mengulang", color: "bg-red-100 text-red-700"     },
];

const SURAH_LIST = [
  "Al-Fatihah","Al-Baqarah","Ali Imran","An-Nisa","Al-Maidah",
  "Al-Ikhlas","Al-Falaq","An-Nas","Al-Kautsar","Al-Ashr",
  "Al-Kafirun","An-Nasr","Al-Masad","Al-Zalzalah","Al-Bayyinah",
];

export default function HafalanForm({ siswaId, siswaName }: { siswaId: number; siswaName: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    startTransition(async () => {
      const result = await createHafalan(fd);
      if (result.success) { setSuccess(result.message); (e.target as HTMLFormElement).reset(); }
      else setError(result.message);
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-gray-800 text-sm pb-3 border-b border-gray-100">
        Input Hafalan — {siswaName}
      </h3>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Surah <span className="text-red-500">*</span></label>
          <select name="surah" required className={inputClass}>
            <option value="">Pilih Surah</option>
            {SURAH_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ayat Mulai <span className="text-red-500">*</span></label>
          <input name="ayatMulai" type="number" min="1" required className={inputClass} placeholder="1" />
        </div>
        <div>
          <label className={labelClass}>Ayat Selesai <span className="text-red-500">*</span></label>
          <input name="ayatSelesai" type="number" min="1" required className={inputClass} placeholder="7" />
        </div>
        <div>
          <label className={labelClass}>Juz</label>
          <input name="juz" type="number" min="1" max="30" className={inputClass} placeholder="1" />
        </div>
        <div>
          <label className={labelClass}>Nilai (0-100)</label>
          <input name="nilai" type="number" min="0" max="100" className={inputClass} placeholder="85" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Status <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-4 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" name="status" value={opt.value} required className="sr-only peer" />
                <div className={`text-center py-2 rounded-lg text-xs font-semibold border-2 border-transparent peer-checked:border-green-600 transition-all ${opt.color}`}>
                  {opt.label}
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Catatan</label>
          <textarea name="catatan" rows={2} className={`${inputClass} resize-none`} placeholder="Catatan tambahan..." />
        </div>
      </div>

      <button type="submit" disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
        {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Hafalan</>}
      </button>
    </form>
  );
}