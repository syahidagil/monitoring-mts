"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrangTua, updateOrangTua } from "@/actions/orangtua.action";
import { Save, Eye, EyeOff, CheckCircle, User, Shield, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import SiswaMultiSelect from "./SiswaMultiSelect";

type Props = {
  defaultValues?: any;
  isEdit?: boolean;
  ortuId?: string;
};

export default function OrangtuaForm({ defaultValues, isEdit, ortuId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [siswaError, setSiswaError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [statusAktif, setStatusAktif] = useState(defaultValues?.status ?? true);

  const defaultSelected = defaultValues?.anak?.map((a: any) => ({
    id: a.id,
    nis: a.nis,
    nama: a.nama,
    kelasNama: a.kelas?.nama ?? "-",
  })) ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSiswaError("");
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    fd.set("status", statusAktif ? "true" : "false");

    const siswaIds = fd.getAll("siswaIds");
    if (siswaIds.length === 0) {
      setSiswaError("Silakan pilih setidaknya satu siswa.");
      return;
    }

    startTransition(async () => {
      const result = isEdit && ortuId
        ? await updateOrangTua(ortuId, fd)
        : await createOrangTua(fd);
      if (result.success) {
        setSuccess(true);
        if (isEdit) router.push("/admin/data-orangtua");
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Data orang tua berhasil disimpan!</p>
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

      {/* SECTION 1 — DATA PRIBADI WALI */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-green-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Data Pribadi Wali</h2>
            <p className="text-xs text-gray-400">Informasi identitas orang tua/wali siswa</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input name="nama" defaultValue={defaultValues?.name} required
                className={inputClass}
                placeholder="Contoh: Budi Santoso, S.T." />
            </div>
            <div>
              <label className={labelClass}>Nomor HP <span className="text-red-500">*</span></label>
              <div className="flex">
                <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500 font-medium">+62</span>
                <input name="noHp" defaultValue={defaultValues?.noHp?.replace(/^(\+62|0)/, "")}
                  required
                  className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="8xx-xxxx-xxxx" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Pekerjaan</label>
            <input name="pekerjaan" defaultValue={defaultValues?.pekerjaan}
              className={inputClass} placeholder="Contoh: Wiraswasta, PNS, Karyawan Swasta" />
          </div>

          <div>
            <label className={labelClass}>Alamat Lengkap</label>
            <textarea name="alamat" defaultValue={defaultValues?.alamat} rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Jl. Veteran No. 123, Bintaro, Pesanggrahan..." />
          </div>
        </div>
      </div>

      {/* SECTION 2 — AKUN & RELASI */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Akun & Relasi</h2>
            <p className="text-xs text-gray-400">Kredensial login dan hubungan dengan siswa</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Kiri: Username & Password */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Username <span className="text-red-500">*</span></label>
                <input name="username" defaultValue={defaultValues?.username}
                  required={!isEdit}
                  disabled={isEdit}
                  className={`${inputClass} ${isEdit ? "bg-gray-100 text-gray-500" : ""}`}
                  placeholder="walimurid2024" />
                <p className="text-xs text-gray-400 mt-1.5">Maksimal 50 karakter alfanumerik.</p>
              </div>

              <div>
                <label className={labelClass}>
                  {isEdit ? "Password Baru" : <>{`Password`} <span className="text-red-500">*</span></>}
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
                <p className="text-xs text-gray-400 mt-1.5">Minimal 8 karakter kombinasi huruf dan angka.</p>
              </div>

              <div>
                <label className={labelClass}>Status Akun</label>
                <div className="flex items-center gap-3 mt-2">
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

            {/* Kanan: Hubungkan dengan Siswa */}
            <div>
              <label className={labelClass}>
                Hubungkan dengan Siswa <span className="text-red-500">*</span>
              </label>
              <SiswaMultiSelect
                defaultSelected={defaultSelected}
                error={siswaError}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Pastikan data yang diinputkan sudah sesuai dengan dokumen yang valid.
          </div>
          <div className="flex gap-3">
            <Link href="/admin/data-orangtua"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" />Simpan Data Wali</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}