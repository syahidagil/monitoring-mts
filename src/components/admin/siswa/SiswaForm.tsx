"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSiswa, updateSiswa } from "@/actions/siswa.action";
import { Save, CheckCircle, UserPlus, Info, AlertCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  kelas: any[];
  orangtua: any[];
  tahunAjaran: any[];
  defaultValues?: any;
  isEdit?: boolean;
  siswaId?: number;
};

export default function SiswaForm({ kelas, orangtua, tahunAjaran, defaultValues, isEdit, siswaId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [statusTahfidz, setStatusTahfidz] = useState(defaultValues?.statusTahfidz ?? false);
  const [statusAktif, setStatusAktif] = useState(defaultValues?.status ?? true);
  const [selectedTahun, setSelectedTahun] = useState<number | "">("");

  const kelasByTahun = selectedTahun
    ? kelas.filter((k) => k.tahunAjaranId === Number(selectedTahun))
    : kelas;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set("statusTahfidz", statusTahfidz ? "true" : "false");
    fd.set("status", statusAktif ? "true" : "false");
    startTransition(async () => {
      const result = isEdit && siswaId
        ? await updateSiswa(siswaId, fd)
        : await createSiswa(fd);
      if (result.success) {
        setSuccess(true);
        if (isEdit) router.push("/admin/data-siswa");
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
            <p className="text-sm font-semibold text-green-800">Data siswa berhasil disimpan!</p>
          </div>
          <button type="button" onClick={() => setSuccess(false)} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}

      {!success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">Sistem siap menerima input data siswa baru.</p>
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
            <h2 className="text-white font-semibold text-sm">Form Input Data Siswa</h2>
            <p className="text-green-300 text-xs mt-0.5">Lengkapi data pribadi dan informasi akademik siswa</p>
          </div>
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* KOLOM KIRI */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">Data Pribadi</h3>

            <div>
              <label className={labelClass}>NIS <span className="text-red-500">*</span></label>
              <input name="nis" defaultValue={defaultValues?.nis} required
                className={inputClass} placeholder="Masukkan NIS" />
            </div>

            <div>
              <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input name="nama" defaultValue={defaultValues?.nama} required
                className={inputClass} placeholder="Masukkan nama lengkap siswa" />
            </div>

            <div>
              <label className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
              <div className="flex gap-6 mt-2">
                {[
                  { value: "L", label: "Laki-laki" },
                  { value: "P", label: "Perempuan" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenisKelamin" value={opt.value}
                      defaultChecked={defaultValues?.jenisKelamin === opt.value || (!defaultValues && opt.value === "L")}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tempat Lahir</label>
                <input name="tempatLahir" defaultValue={defaultValues?.tempatLahir}
                  className={inputClass} placeholder="Kota/kabupaten" />
              </div>
              <div>
                <label className={labelClass}>Tanggal Lahir <span className="text-red-500">*</span></label>
                <input name="tanggalLahir" type="date" required
                  defaultValue={defaultValues?.tanggalLahir ? new Date(defaultValues.tanggalLahir).toISOString().split("T")[0] : ""}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Alamat Lengkap</label>
              <textarea name="alamat" defaultValue={defaultValues?.alamat} rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Alamat lengkap tempat tinggal" />
            </div>

            <div>
              <label className={labelClass}>Tahun Pelajaran</label>
              <select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value ? Number(e.target.value) : "")}
                className={inputClass}>
                <option value="">-- Semua Tahun Ajaran --</option>
                {tahunAjaran.map((ta) => (
                  <option key={ta.id} value={ta.id}>{ta.nama} {ta.aktif ? "(Aktif)" : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Kelas <span className="text-red-500">*</span></label>
              <select name="kelasId" defaultValue={defaultValues?.kelasId} required className={inputClass}>
                <option value="">-- Pilih Kelas --</option>
                {kelasByTahun.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} - {k.tahunAjaran.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status Tahfidz</label>
              <div className="flex items-center gap-3 mt-1">
                <button type="button"
                  onClick={() => setStatusTahfidz(!statusTahfidz)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${statusTahfidz ? "bg-green-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${statusTahfidz ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-medium ${statusTahfidz ? "text-green-700" : "text-gray-400"}`}>
                  {statusTahfidz ? "Aktif Program" : "Tidak Aktif"}
                </span>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">Data Keluarga & Akun</h3>

            <div>
              <label className={labelClass}>Nama Ayah</label>
              <input name="namaAyah" defaultValue={defaultValues?.namaAyah}
                className={inputClass} placeholder="Nama ayah kandung" />
            </div>

            <div>
              <label className={labelClass}>Nama Ibu</label>
              <input name="namaIbu" defaultValue={defaultValues?.namaIbu}
                className={inputClass} placeholder="Nama ibu kandung" />
            </div>

            <div>
              <label className={labelClass}>Akun Wali / Orang Tua</label>
              <select name="orangTuaId" defaultValue={defaultValues?.orangTuaId ?? ""} className={inputClass}>
                <option value="">-- Pilih akun orang tua (opsional) --</option>
                {orangtua.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.user.name} {o.noHp ? `(${o.noHp})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status Siswa</label>
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

            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 text-xs text-gray-400 mb-5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Pastikan seluruh data yang diinputkan sudah sesuai dengan berkas pendaftaran siswa.
              </div>
              <div className="flex gap-3 justify-end">
                <Link href="/admin/data-siswa"
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
        </div>
      </div>
    </form>
  );
}