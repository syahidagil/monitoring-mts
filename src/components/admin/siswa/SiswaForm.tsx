"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSiswa, updateSiswa } from "@/actions/siswa.action";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Kelas = { id: number; nama: string; tingkat: number };
type OrangTua = { id: string; user: { name: string } };

type Props = {
  kelas: Kelas[];
  orangtua: OrangTua[];
  defaultValues?: any;
  isEdit?: boolean;
  siswaId?: number;
};

export default function SiswaForm({ kelas, orangtua, defaultValues, isEdit, siswaId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && siswaId
        ? await updateSiswa(siswaId, fd)
        : await createSiswa(fd);
      if (result.success) {
        router.push("/admin/data-siswa");
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm pb-3 border-b border-gray-100">Data Diri Siswa</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>NIS <span className="text-red-500">*</span></label>
            <input name="nis" defaultValue={defaultValues?.nis} required className={inputClass} placeholder="Nomor Induk Siswa" />
          </div>
          <div>
            <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
            <input name="nama" defaultValue={defaultValues?.nama} required className={inputClass} placeholder="Nama lengkap siswa" />
          </div>
          <div>
            <label className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
            <select name="jenisKelamin" defaultValue={defaultValues?.jenisKelamin ?? "L"} className={inputClass}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tempat Lahir</label>
            <input name="tempatLahir" defaultValue={defaultValues?.tempatLahir} className={inputClass} placeholder="Kota/kabupaten" />
          </div>
          <div>
            <label className={labelClass}>Tanggal Lahir <span className="text-red-500">*</span></label>
            <input name="tanggalLahir" type="date"
              defaultValue={defaultValues?.tanggalLahir ? new Date(defaultValues.tanggalLahir).toISOString().split("T")[0] : ""}
              required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Kelas <span className="text-red-500">*</span></label>
            <select name="kelasId" defaultValue={defaultValues?.kelasId} required className={inputClass}>
              <option value="">-- Pilih Kelas --</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>Kelas {k.nama}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Alamat</label>
          <textarea name="alamat" defaultValue={defaultValues?.alamat} rows={2}
            className={`${inputClass} resize-none`} placeholder="Alamat lengkap siswa" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm pb-3 border-b border-gray-100">Data Orang Tua</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nama Ayah</label>
            <input name="namaAyah" defaultValue={defaultValues?.namaAyah} className={inputClass} placeholder="Nama ayah kandung" />
          </div>
          <div>
            <label className={labelClass}>Nama Ibu</label>
            <input name="namaIbu" defaultValue={defaultValues?.namaIbu} className={inputClass} placeholder="Nama ibu kandung" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Akun Orang Tua</label>
            <select name="orangTuaId" defaultValue={defaultValues?.orangTuaId ?? ""} className={inputClass}>
              <option value="">-- Pilih akun orang tua (opsional) --</option>
              {orangtua.map((o) => (
                <option key={o.id} value={o.id}>{o.user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm pb-3 border-b border-gray-100">Status</h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="statusTahfidz" value="false" />
            <input type="checkbox" name="statusTahfidz" value="true"
              defaultChecked={defaultValues?.statusTahfidz}
              onChange={(e) => {
                const hidden = e.currentTarget.previousElementSibling as HTMLInputElement;
                hidden.disabled = e.currentTarget.checked;
              }}
              className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Ikut Program Tahfidz</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="status" value="false" />
            <input type="checkbox" name="status" value="true"
              defaultChecked={defaultValues?.status ?? true}
              onChange={(e) => {
                const hidden = e.currentTarget.previousElementSibling as HTMLInputElement;
                hidden.disabled = e.currentTarget.checked;
              }}
              className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Status Aktif</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/data-siswa" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Siswa"}
        </button>
      </div>
    </form>
  );
}