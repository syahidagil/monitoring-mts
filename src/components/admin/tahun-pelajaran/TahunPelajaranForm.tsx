"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTahunAjaran, updateTahunAjaran } from "@/actions/tahunAjaran.action";
import { Save, CalendarDays, CheckCircle, AlertCircle, Info } from "lucide-react";
import Link from "next/link";

type Props = { defaultValues?: any; isEdit?: boolean; taId?: number };

export default function TahunPelajaranForm({ defaultValues, isEdit, taId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [aktif, setAktif] = useState(defaultValues?.aktif ?? false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set("aktif", aktif ? "true" : "false");
    startTransition(async () => {
      const result = isEdit && taId
        ? await updateTahunAjaran(taId, fd)
        : await createTahunAjaran(fd);
      if (result.success) {
        setSuccess(true);
        if (isEdit) router.push("/admin/tahun-pelajaran");
        else (e.target as HTMLFormElement).reset();
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-semibold text-green-800">Tahun ajaran berhasil {isEdit ? "diperbarui" : "ditambahkan"}!</p>
          <button type="button" onClick={() => setSuccess(false)} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-white font-semibold text-sm">
            {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Tahun Ajaran <span className="text-red-500">*</span></label>
            <input name="nama" defaultValue={defaultValues?.nama} required
              className={inputClass} placeholder="Contoh: 2025/2026" />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" /> Format: YYYY/YYYY (contoh: 2024/2025)
            </p>
          </div>

          <div>
            <label className={labelClass}>Semester <span className="text-red-500">*</span></label>
            <select name="semester" defaultValue={defaultValues?.semester ?? ""} required className={inputClass}>
              <option value="">-- Pilih Semester --</option>
              <option value="GANJIL">Semester Ganjil</option>
              <option value="GENAP">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status Aktif</label>
            <div className="flex items-center gap-3 mt-1">
              <button type="button"
                onClick={() => setAktif(!aktif)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aktif ? "bg-green-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${aktif ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${aktif ? "text-green-700" : "text-gray-400"}`}>
                {aktif ? "Aktif (tahun ajaran lain akan dinonaktifkan)" : "Tidak Aktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">* Wajib diisi</p>
          <div className="flex gap-3">
            <Link href="/admin/tahun-pelajaran"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" />Simpan</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}