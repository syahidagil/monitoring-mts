"use client";

import { createGuru } from "@/actions/guru.action";
import { ArrowLeft, Eye, EyeOff, Info, Loader2, Save, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

export default function GuruInputForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    startTransition(async () => {
      const result = await createGuru(formData);
      if (result.success) {
        setNotice({ type: "success", text: result.message ?? "Data guru berhasil disimpan ke sistem monitoring." });
        formRef.current?.reset();
        setShowPassword(false);
      } else {
        setNotice({ type: "error", text: result.message });
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
              <p className="font-semibold">{notice.type === "success" ? "Data guru berhasil disimpan ke sistem monitoring." : "Gagal menyimpan data guru"}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">{notice.type === "success" ? "Data guru baru telah berhasil diverifikasi dan ditambahkan." : notice.text}</p>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="rounded-full p-1 text-current transition hover:bg-black/5" aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 bg-emerald-950 px-6 py-5 text-white">
          <div>
            <h2 className="text-lg font-semibold">Form Input Data Guru</h2>
            <p className="text-sm text-emerald-100">Lengkapi profil, akun, dan informasi kepegawaian guru.</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">INFORMASI PROFIL</p>
              <div className="mt-2 h-px w-full bg-emerald-100" />
            </div>

            <div>
              <label className={labelClass}>NIP <span className="text-rose-500">*</span></label>
              <input name="nip" placeholder="Contoh: 198001012010121001" maxLength={20} className={inputClass} inputMode="numeric" />
            </div>

            <div>
              <label className={labelClass}>Nama Lengkap <span className="text-rose-500">*</span></label>
              <input name="nama" required placeholder="Masukkan nama lengkap beserta gelar" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Nomor Handphone</label>
              <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                <span className="flex items-center border-r border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600">+62</span>
                <input name="noHp" placeholder="81234567890" className="w-full px-4 py-3 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Status Keaktifan</label>
              <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Aktif</span>
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
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">KREDENSIAL AKUN</p>
              <div className="mt-2 h-px w-full bg-emerald-100" />
            </div>

            <div>
              <label className={labelClass}>Username <span className="text-rose-500">*</span></label>
              <input name="username" required placeholder="buat_username" className={inputClass} />
              <p className="mt-2 text-xs leading-5 text-slate-500">Akan digunakan guru untuk login ke sistem.</p>
            </div>

            <div>
              <label className={labelClass}>Password <span className="text-rose-500">*</span></label>
              <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100">
                <input name="password" required minLength={8} type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter" className="w-full px-4 py-3 text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="px-4 text-slate-500 transition hover:text-slate-700" aria-label="Tampilkan atau sembunyikan password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Minimal 8 karakter.</p>
            </div>

            <div>
              <label className={labelClass}>Alamat Lengkap</label>
              <textarea name="alamat" rows={5} placeholder="Masukkan alamat lengkap rumah tinggal saat ini" className={`${inputClass} resize-none`} />
            </div>

            <input type="hidden" name="mapel" value="Belum ditentukan" />
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <p>Pastikan data NIP dan Nama Lengkap sesuai dengan dokumen resmi kepegawaian.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/data-guru" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
              Batal
            </Link>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Data
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
