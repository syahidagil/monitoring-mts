"use client";

import { createOrangTua } from "@/actions/orangtua.action";
import { ArrowLeft, Eye, EyeOff, Loader2, Save, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import SiswaMultiSelect from "./SiswaMultiSelect";

export default function OrangtuaInputForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    if (formData.getAll("siswaIds").length === 0) {
      const message = "Silakan pilih setidaknya satu siswa.";
      setStudentError(message);
      setNotice({ type: "error", text: message });
      return;
    }

    startTransition(async () => {
      const result = await createOrangTua(formData);
      if (result.success) {
        setNotice({ type: "success", text: result.message ?? "Data orang tua berhasil disimpan." });
        formRef.current?.reset();
        setShowPassword(false);
        setResetSignal((current) => current + 1);
        setStudentError(null);
      } else {
        setNotice({ type: "error", text: result.message });
        if (result.message.includes("siswa")) setStudentError(result.message);
      }
    });
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {notice && (
        <div className={`rounded-2xl border px-4 py-4 shadow-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{notice.type === "success" ? "Data orang tua berhasil disimpan." : "Gagal menyimpan data orang tua"}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">{notice.type === "success" ? "Relasi siswa dan akun wali telah berhasil dibuat." : notice.text}</p>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="rounded-full p-1 text-current transition hover:bg-black/5" aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Data Pribadi Wali</h2>
              <p className="text-sm text-slate-500">Informasi identitas dan kontak orang tua/wali.</p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Nama Lengkap <span className="text-rose-500">*</span></label>
                <input name="nama" required placeholder="Contoh: Budi Santoso, S.T." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nomor HP <span className="text-rose-500">*</span></label>
                <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                  <span className="flex items-center border-r border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600">+62</span>
                  <input name="noHp" placeholder="81234567890" className="w-full px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Alamat Lengkap</label>
                <textarea name="alamat" rows={4} placeholder="Jl. Veteran No. 123, Bintaro, Pesanggrahan..." className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Akun & Relasi</h2>
              <p className="text-sm text-slate-500">Akun login dan siswa yang dihubungkan ke wali.</p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Username <span className="text-rose-500">*</span></label>
                <input name="username" required placeholder="walimurid2024" maxLength={50} className={inputClass} />
                <p className="mt-2 text-xs leading-5 text-slate-500">Maksimal 50 karakter alfanumerik.</p>
              </div>
              <div>
                <label className={labelClass}>Password <span className="text-rose-500">*</span></label>
                <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                  <input name="password" required minLength={8} type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter kombinasi huruf dan angka" className="w-full px-4 py-3 text-sm outline-none" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="px-4 text-slate-500 transition hover:text-slate-700" aria-label="Tampilkan atau sembunyikan password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">Minimal 8 karakter kombinasi huruf dan angka.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Status Akun</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="hidden" name="status" value="false" />
                <input
                  type="checkbox"
                  name="status"
                  value="true"
                  defaultChecked
                  onChange={(event) => {
                    const hidden = event.currentTarget.previousElementSibling as HTMLInputElement;
                    hidden.disabled = event.currentTarget.checked;
                  }}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-600" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </label>
            </div>

            <div>
              <p className={labelClass}>Hubungkan dengan Siswa</p>
              <SiswaMultiSelect key={resetSignal} errorMessage={studentError} onSelectionChange={(selected) => {
                if (selected.length > 0) setStudentError(null);
              }} />
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-500">Pastikan seluruh data yang diinputkan sudah sesuai dengan berkas pendaftaran siswa.</p>
        <div className="flex items-center gap-3">
          <Link href="/admin/data-orangtua" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Batal
          </Link>
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Data Wali
          </button>
        </div>
      </div>
    </form>
  );
}
