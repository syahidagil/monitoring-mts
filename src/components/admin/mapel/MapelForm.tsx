"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createMapel, updateMapel } from "@/actions/mapel.action";
import { ArrowLeft, Save, CheckCircle, BookOpen, Info } from "lucide-react";
import Link from "next/link";

type Props = {
  defaultValues?: any;
  isEdit?: boolean;
  tahunAktif?: any;
};

export default function MapelForm({ defaultValues, isEdit, tahunAktif }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (isEdit && defaultValues?.kodeMapel) {
        const namaMapel = fd.get("namaMapel") as string;
        result = await updateMapel(defaultValues.kodeMapel, namaMapel);
      } else {
        result = await createMapel(fd);
      }

      if (result.success) {
        setSuccess(true);
        if (!isEdit) formRef.current?.reset();
        else router.push("/admin/mata-pelajaran");
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Data mata pelajaran berhasil disimpan!</p>
            <p className="text-xs text-green-600 mt-0.5">Informasi mata pelajaran baru telah ditambahkan ke database sistem monitoring sekolah.</p>
          </div>
          <button type="button" onClick={() => setSuccess(false)} className="ml-auto text-green-400 hover:text-green-600 text-lg leading-none">&times;</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-white font-semibold text-sm">Input Data Mata Pelajaran</h2>
          </div>
          {tahunAktif && (
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
              ACADEMIC YEAR {tahunAktif.nama}
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelClass}>
              Kode Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <input
              name="kodeMapel"
              defaultValue={defaultValues?.kodeMapel}
              required
              maxLength={5}
              disabled={isEdit}
              onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
              className={`${inputClass} uppercase font-mono tracking-widest ${isEdit ? "bg-gray-100 text-gray-500" : ""}`}
              placeholder="Contoh: MTK, IPA, BIN"
            />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Kode unik maksimal 5 karakter, tidak bisa diubah setelah disimpan.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Nama Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <input
              name="namaMapel"
              defaultValue={defaultValues?.namaMapel}
              required
              maxLength={20}
              className={inputClass}
              placeholder="Masukkan Nama Mata Pelajaran (Contoh: Fiqih, Bahasa Arab, Matematika)"
            />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Gunakan nama resmi sesuai kurikulum kementerian agama.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">* Wajib diisi</p>
          <div className="flex gap-3">
            <Link href="/admin/mata-pelajaran"
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