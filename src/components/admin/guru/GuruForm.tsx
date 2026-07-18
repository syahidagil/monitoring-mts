"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGuru, updateGuru } from "@/actions/guru.action";
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, UserPlus, Info, AlertCircle } from "lucide-react";
import Link from "next/link";

type Props = { defaultValues?: any; isEdit?: boolean; guruId?: string };

export default function GuruForm({ defaultValues, isEdit, guruId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [statusAktif, setStatusAktif] = useState(defaultValues?.status ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set("status", statusAktif ? "true" : "false");
    startTransition(async () => {
      const result = isEdit && guruId
        ? await updateGuru(guruId, fd)
        : await createGuru(fd);
      if (result.success) {
        setSuccess(true);
        if (isEdit) router.push("/admin/data-guru");
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Data guru berhasil disimpan ke sistem monitoring.</p>
          </div>
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
        <div className="bg-[#1B5E20] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">Form Input Data Guru</h2>
            <p className="text-green-300 text-xs mt-0.5">Lengkapi informasi profil dan kredensial akun guru</p>
          </div>
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* KOLOM KIRI — INFORMASI PROFIL */}
          <div className="p-6 space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              Informasi Profil
            </h3>

            <div>
              <label className={labelClass}>NIP <span className="text-red-500 normal-case">*</span></label>
              <input name="nip" defaultValue={defaultValues?.nip}
                maxLength={20}
                className={inputClass}
                placeholder="Contoh: 198001012010121001" />
            </div>

            <div>
              <label className={labelClass}>Nama Lengkap <span className="text-red-500 normal-case">*</span></label>
              <input name="nama" defaultValue={defaultValues?.name} required
                className={inputClass}
                placeholder="Masukkan nama lengkap beserta gelar" />
            </div>

            <div>
              <label className={labelClass}>Nomor Handphone</label>
              <div className="flex">
                <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500 font-medium">+62</span>
                <input name="noHp" defaultValue={defaultValues?.noHp?.replace(/^(\+62|0)/, "")}
                  className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="8xx-xxxx-xxxx" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Mata Pelajaran</label>
              <input name="mapel" defaultValue={defaultValues?.mapel}
                className={inputClass}
                placeholder="Contoh: Matematika, IPA" />
            </div>

            <div>
              <label className={labelClass}>Status Keaktifan</label>
              <div className="flex items-center gap-3 mt-1">
                <button type="button"
                  onClick={() => setStatusAktif(!statusAktif)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${statusAktif ? "bg-green-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${statusAktif ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-medium ${statusAktif ? "text-green-700" : "text-gray-400"}`}>
                  {statusAktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN — KREDENSIAL AKUN */}
          <div className="p-6 space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              Kredensial Akun
            </h3>

            <div>
              <label className={labelClass}>Username <span className="text-red-500 normal-case">*</span></label>
              <input name="username" defaultValue={defaultValues?.username}
                required={!isEdit}
                disabled={isEdit}
                className={`${inputClass} ${isEdit ? "bg-gray-100 text-gray-500" : ""}`}
                placeholder="buat_username" />
              <p className="text-xs text-gray-400 mt-1.5">Akan digunakan guru untuk login ke sistem</p>
            </div>

            <div>
              <label className={labelClass}>
                {isEdit ? "Password Baru (kosongkan jika tidak diubah)" : <>{`Password`} <span className="text-red-500 normal-case">*</span></>}
              </label>
              <div className="relative">
                <input name="password" type={showPw ? "text" : "password"}
                  required={!isEdit}
                  minLength={isEdit ? undefined : 8}
                  className={`${inputClass} pr-10`}
                  placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Min. 8 karakter"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Minimal 8 karakter</p>
            </div>

            <div>
              <label className={labelClass}>Pendidikan Terakhir</label>
              <input name="pendidikan" defaultValue={defaultValues?.pendidikan}
                className={inputClass}
                placeholder="Contoh: S1 Matematika UGM" />
            </div>

            <div>
              <label className={labelClass}>Alamat Lengkap</label>
              <textarea name="alamat" defaultValue={defaultValues?.alamat} rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Masukkan alamat lengkap rumah tinggal saat ini" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Pastikan data NIP dan Nama Lengkap sesuai dengan dokumen resmi kepegawaian.
          </div>
          <div className="flex gap-3">
            <Link href="/admin/data-guru"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" />Simpan Data</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}