"use client";

import { createKelas } from "@/actions/kelas.action";
import { ArrowLeft, Loader2, ListChecks, Save, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

type TahunAjaran = {
  id: number;
  nama: string;
  semester: string;
  aktif: boolean;
};

type Guru = {
  id: string;
  user: { name: string | null };
};

type Props = {
  tahunAjaran: TahunAjaran[];
  guru: Guru[];
  activeTahunAjaranId?: number;
};

export default function KelasInputForm({ tahunAjaran, guru, activeTahunAjaranId }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    startTransition(async () => {
      const result = await createKelas(formData);
      if (result.success) {
        setNotice({ type: "success", text: result.message ?? "Data Kelas Berhasil Disimpan!" });
        formRef.current?.reset();
      } else {
        setNotice({ type: "error", text: result.message });
      }
    });
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const activeYear = activeTahunAjaranId ?? tahunAjaran.find((item) => item.aktif)?.id ?? tahunAjaran[0]?.id ?? "";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {notice && (
        <div className={`rounded-2xl border px-4 py-4 shadow-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{notice.type === "success" ? "Data Kelas Berhasil Disimpan!" : "Gagal menyimpan data kelas"}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">
                {notice.type === "success"
                  ? "Input data baru telah berhasil diverifikasi dan ditambahkan ke basis data akademik."
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
        <div className="flex items-center gap-3 bg-emerald-950 px-6 py-5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Form Input Data Kelas</h2>
            <p className="text-sm text-emerald-100">Lengkapi data kelas baru untuk manajemen akademik.</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className={labelClass}>Nama Kelas <span className="text-rose-500">*</span></label>
            <input name="nama" required maxLength={20} placeholder="Masukkan Nama Kelas (Contoh: VII A)" className={inputClass} />
            <p className="mt-2 text-xs leading-5 text-slate-500">Pastikan format penulisan seragam (Contoh: VII A, VIII B, dst).</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Tahun Ajaran <span className="text-rose-500">*</span></label>
              <select name="tahunAjaranId" defaultValue={activeYear} required className={inputClass}>
                {tahunAjaran.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} {item.aktif ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Wali Kelas (opsional)</label>
              <select name="waliKelasId" defaultValue="" className={inputClass}>
                <option value="">-- Pilih Wali Kelas --</option>
                {guru.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.user?.name ?? "-"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">* Wajib diisi</p>
            <div className="flex items-center gap-3">
              <Link href="/admin/data-kelas" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
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
      </div>
    </form>
  );
}
