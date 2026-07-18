"use client";

import { checkNisExists, createSiswa } from "@/actions/siswa.action";
import { ArrowLeft, Loader2, Save, UserRoundPlus, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

type Kelas = {
  id: number;
  nama: string;
  tingkat: number;
  tahunAjaran: { nama: string };
};

type OrangTua = {
  id: string;
  noHp: string | null;
  user: { name: string | null };
};

type TahunAjaran = {
  id: number;
  nama: string;
  aktif: boolean;
};

type Props = {
  kelas: Kelas[];
  orangtua: OrangTua[];
  tahunAjaran: TahunAjaran[];
};

export default function SiswaInputForm({ kelas, orangtua, tahunAjaran }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const nisRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [nisChecking, setNisChecking] = useState(false);
  const [nisError, setNisError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeYearId = tahunAjaran.find((item) => item.aktif)?.id ?? tahunAjaran[0]?.id ?? "";

  async function handleNisBlur() {
    const nis = nisRef.current?.value.trim();
    if (!nis) return;

    setNisChecking(true);
    try {
      const result = await checkNisExists(nis);
      setNisError(result.exists ? "NIS sudah terdaftar" : null);
    } finally {
      setNisChecking(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const nis = String(formData.get("nis") ?? "").trim();
    if (nis) {
      const duplicate = await checkNisExists(nis);
      if (duplicate.exists) {
        setNisError("NIS sudah terdaftar");
        setNotice({ type: "error", text: "NIS sudah terdaftar" });
        return;
      }
    }

    startTransition(async () => {
      const result = await createSiswa(formData);
      if (result.success) {
        setNotice({ type: "success", text: result.message ?? "Sistem siap menerima input data siswa baru." });
        formRef.current?.reset();
        setNisError(null);
      } else {
        setNotice({ type: "error", text: result.message });
      }
    });
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
  const errorInputClass = `${inputClass} border-rose-300 focus:border-rose-500 focus:ring-rose-100`;
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-800 shadow-sm">
        <p className="font-semibold">Sistem siap menerima input data siswa baru.</p>
      </div>

      {notice && (
        <div className={`rounded-2xl border px-4 py-4 shadow-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{notice.type === "success" ? "Data siswa berhasil disimpan!" : "Gagal menyimpan data siswa"}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">{notice.type === "success" ? "Input data baru telah berhasil diverifikasi dan ditambahkan." : notice.text}</p>
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
            <UserRoundPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Form Input Data Siswa</h2>
            <p className="text-sm text-emerald-100">Masukkan data identitas, keluarga, dan relasi kelas siswa.</p>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>NIS <span className="text-rose-500">*</span></label>
                <input
                  ref={nisRef}
                  name="nis"
                  required
                  placeholder="Masukkan NIS"
                  onBlur={handleNisBlur}
                  onChange={() => setNisError(null)}
                  className={nisError ? errorInputClass : inputClass}
                />
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {nisChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : null}
                  <span className={nisError ? "text-rose-600" : "text-slate-500"}>{nisError ?? "Validasi realtime onBlur memastikan NIS belum dipakai."}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Nama Lengkap <span className="text-rose-500">*</span></label>
                <input name="nama" required placeholder="Masukkan Nama Lengkap" className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Jenis Kelamin <span className="text-rose-500">*</span></label>
                <div className="flex gap-6 rounded-xl border border-slate-300 bg-white px-4 py-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="radio" name="jenisKelamin" value="L" defaultChecked className="h-4 w-4 accent-emerald-700" />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="radio" name="jenisKelamin" value="P" className="h-4 w-4 accent-emerald-700" />
                    Perempuan
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tempat Lahir</label>
                <input name="tempatLahir" placeholder="Tempat lahir" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Tanggal Lahir <span className="text-rose-500">*</span></label>
                <input name="tanggalLahir" type="date" required className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Alamat Lengkap</label>
              <textarea name="alamat" rows={4} placeholder="Masukkan alamat lengkap" className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className={labelClass}>Kelas <span className="text-rose-500">*</span></label>
              <select name="kelasId" defaultValue="" required className={inputClass}>
                <option value="">-- Pilih Kelas --</option>
                {kelas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} - {item.tahunAjaran?.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status Tahfidz</label>
              <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Aktif Program</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="hidden" name="statusTahfidz" value="false" />
                  <input
                    type="checkbox"
                    name="statusTahfidz"
                    value="true"
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
              <label className={labelClass}>Tahun Pelajaran</label>
              <select defaultValue={activeYearId} disabled className={inputClass}>
                {tahunAjaran.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} {item.aktif ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">Informasi ini dipakai untuk referensi kelas dan tidak disimpan langsung di data siswa.</p>
            </div>

            <div>
              <label className={labelClass}>Nama Ayah</label>
              <input name="namaAyah" placeholder="Nama ayah" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Nama Ibu</label>
              <input name="namaIbu" placeholder="Nama ibu" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Nama Wali</label>
              <select name="orangTuaId" defaultValue="" className={inputClass}>
                <option value="">-- Pilih Wali --</option>
                {orangtua.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.user?.name ?? "-"} {item.noHp ? `- ${item.noHp}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Ringkasan Data</p>
              <div className="space-y-2 text-sm text-slate-500">
                <p>Pastikan seluruh data yang diinputkan sudah sesuai dengan berkas pendaftaran siswa.</p>
                <p>Relasi kelas akan menentukan tahun pelajaran siswa secara otomatis.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Link href="/admin/data-siswa" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
                Batal
              </Link>
              <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Data
              </button>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
