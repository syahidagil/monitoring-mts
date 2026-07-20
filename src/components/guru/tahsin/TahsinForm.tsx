"use client";
import { useState, useTransition } from "react";
import { createTahsin } from "@/actions/guru/tahsin.action";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const MATERI_LIST = [
  "Makharijul Huruf","Sifatul Huruf","Hukum Nun Mati & Tanwin",
  "Hukum Mim Mati","Mad dan Qashr","Waqaf dan Ibtida",
  "Tafkhim dan Tarqiq","Idgham","Ikhfa","Iqlab",
];

const STATUS_OPTIONS = [
  { value: "BELUM",     label: "Belum",     color: "bg-gray-100 text-gray-600"   },
  { value: "PROSES",    label: "Proses",    color: "bg-blue-100 text-blue-700"   },
  { value: "LULUS",     label: "Lulus",     color: "bg-green-100 text-green-700" },
  { value: "MENGULANG", label: "Mengulang", color: "bg-red-100 text-red-700"     },
];

export default function TahsinForm({ siswaId, siswaName }: { siswaId: number; siswaName: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    startTransition(async () => {
      const result = await createTahsin(fd);
      if (result.success) { setSuccess(result.message); (e.target as HTMLFormElement).reset(); }
      else setError(result.message);
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="font-bold text-gray-800 text-sm pb-3 border-b border-gray-100">
        Input Tahsin — {siswaName}
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

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Materi <span className="text-red-500">*</span></label>
          <select name="materi" required className={inputClass}>
            <option value="">Pilih Materi</option>
            {MATERI_LIST.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nilai (0-100)</label>
          <input name="nilai" type="number" min="0" max="100" className={inputClass} placeholder="85" />
        </div>
        <div>
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
        <div>
          <label className={labelClass}>Catatan</label>
          <textarea name="catatan" rows={2} className={`${inputClass} resize-none`} placeholder="Catatan tambahan..." />
        </div>
      </div>

      <button type="submit" disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
        {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Tahsin</>}
      </button>
    </form>
  );
}