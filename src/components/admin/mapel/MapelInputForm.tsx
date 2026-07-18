"use client";

import { createMapel } from "@/actions/mapel.action";
import { ArrowLeft, BookOpenText, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

type Props = {
  academicYearLabel: string;
};

export default function MapelInputForm({ academicYearLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    startTransition(async () => {
      const result = await createMapel(formData);
      if (result.success) {
        setNotice({ type: "success", text: result.message ?? "Data mata pelajaran berhasil disimpan!" });
        formRef.current?.reset();
      } else {
        setNotice({ type: "error", text: result.message });
      }
    });
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {notice && (
        <div className={`rounded-2xl border px-4 py-4 shadow-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{notice.type === "success" ? "Data mata pelajaran berhasil disimpan!" : "Gagal menyimpan data mata pelajaran"}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">
                {notice.type === "success"
                  ? "Informasi mata pelajaran baru telah ditambahkan ke database sistem monitoring sekolah."
                  : notice.text}
              </p>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="rounded-full p-1 text-current transition hover:bg-black/5" aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Input Data Mata Pelajaran</h2>
              <p className="text-sm text-slate-500">Tambahkan mapel baru ke database akademik.</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Academic Year {academicYearLabel}
          </span>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className={labelClass}>Kode Mata Pelajaran <span className="text-rose-500">*</span></label>
            <input
              name="kodeMapel"
              required
              maxLength={5}
              placeholder="Contoh: MTK, IPA, BIN"
              onChange={(event) => {
                event.currentTarget.value = event.currentTarget.value.toUpperCase();
              }}
              className={`${inputClass} font-mono uppercase tracking-wide`}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">Kode unik maksimal 5 karakter, tidak bisa diubah setelah disimpan.</p>
          </div>

          <div>
            <label className={labelClass}>Nama Mata Pelajaran <span className="text-rose-500">*</span></label>
            <input
              name="namaMapel"
              required
              maxLength={20}
              placeholder="Masukkan Nama Mata Pelajaran (Contoh: Fiqih, Bahasa Arab, Matematika)"
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">Gunakan nama resmi sesuai kurikulum kementerian agama.</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link href="/admin/mata-pelajaran" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
              Batal
            </Link>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
