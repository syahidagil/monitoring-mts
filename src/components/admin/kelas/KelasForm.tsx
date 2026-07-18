"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createKelas, updateKelas } from "@/actions/kelas.action";
import { ArrowLeft, Save, CheckCircle, List, Info } from "lucide-react";
import Link from "next/link";

type Props = {
  tahunAjaran: any[];
  guru: any[];
  defaultValues?: any;
  isEdit?: boolean;
  kelasId?: number;
  defaultTahunAjaranId?: number;
};

export default function KelasForm({ tahunAjaran, guru, defaultValues, isEdit, kelasId, defaultTahunAjaranId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && kelasId
        ? await updateKelas(kelasId, fd)
        : await createKelas(fd);
      if (result.success) {
        setSuccess(true);
        if (!isEdit) (e.target as HTMLFormElement).reset();
        else router.push("/admin/data-kelas");
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Data Kelas Berhasil Disimpan!</p>
            <p className="text-xs text-green-600 mt-0.5">Input data baru telah berhasil diverifikasi dan ditambahkan ke basis data akademik.</p>
          </div>
          <button type="button" onClick={() => setSuccess(false)} className="ml-auto text-green-400 hover:text-green-600 text-lg leading-none">&times;</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <List className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Form Input Data Kelas</h2>
            <p className="text-green-300 text-xs">Lengkapi semua field yang bertanda bintang</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Nama Kelas <span className="text-red-500">*</span></label>
            <input
              name="nama"
              defaultValue={defaultValues?.nama}
              required
              className={inputClass}
              placeholder="Masukkan Nama Kelas (Contoh: VII A)"
            />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Pastikan format penulisan seragam (Contoh: VII A, VIII B, dst).
            </p>
          </div>

          <div>
            <label className={labelClass}>Tahun Ajaran <span className="text-red-500">*</span></label>
            <select
              name="tahunAjaranId"
              defaultValue={defaultValues?.tahunAjaranId ?? defaultTahunAjaranId}
              required
              className={inputClass}
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunAjaran.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} - Semester {ta.semester} {ta.aktif ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Wali Kelas <span className="text-gray-400 font-normal">(opsional)</span></label>
            <select
              name="waliKelasId"
              defaultValue={defaultValues?.waliKelasId ?? ""}
              className={inputClass}
            >
              <option value="">-- Belum Ditentukan --</option>
              {guru.map((g) => (
                <option key={g.id} value={g.id}>{g.user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">* Wajib diisi</p>
          <div className="flex gap-3">
            <Link href="/admin/data-kelas"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" />{isEdit ? "Simpan Perubahan" : "Simpan"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}