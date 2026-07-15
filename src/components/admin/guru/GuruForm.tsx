"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGuru, updateGuru } from "@/actions/guru.action";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Props = { defaultValues?: any; isEdit?: boolean; guruId?: string };

export default function GuruForm({ defaultValues, isEdit, guruId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && guruId ? await updateGuru(guruId, fd) : await createGuru(fd);
      if (result.success) router.push("/admin/data-guru");
      else setMessage({ type: "error", text: result.message });
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{message.text}</div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm pb-3 border-b border-gray-100">Akun Login</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Username <span className="text-red-500">*</span></label>
            <input name="username" defaultValue={defaultValues?.username} required disabled={isEdit}
              className={`${inputClass} ${isEdit ? "bg-gray-100" : ""}`} placeholder="Username login" />
          </div>
          <div>
            <label className={labelClass}>{isEdit ? "Password Baru (kosongkan jika tidak diubah)" : "Password *"}</label>
            <input name="password" type="password" required={!isEdit} minLength={6}
              className={inputClass} placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm pb-3 border-b border-gray-100">Data Guru</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
            <input name="name" defaultValue={defaultValues?.name} required className={inputClass} placeholder="Nama lengkap dengan gelar" />
          </div>
          <div>
            <label className={labelClass}>NIP</label>
            <input name="nip" defaultValue={defaultValues?.nip} className={inputClass} placeholder="Nomor Induk Pegawai" />
          </div>
          <div>
            <label className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
            <input name="mapel" defaultValue={defaultValues?.mapel} required className={inputClass} placeholder="Contoh: Matematika" />
          </div>
          <div>
            <label className={labelClass}>No. HP</label>
            <input name="noHp" defaultValue={defaultValues?.noHp} className={inputClass} placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className={labelClass}>Pendidikan Terakhir</label>
            <input name="pendidikan" defaultValue={defaultValues?.pendidikan} className={inputClass} placeholder="Contoh: S1 Matematika UGM" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={defaultValues?.status !== false ? "true" : "false"} className={inputClass}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Alamat</label>
          <textarea name="alamat" defaultValue={defaultValues?.alamat} rows={2}
            className={`${inputClass} resize-none`} placeholder="Alamat lengkap" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link href="/admin/data-guru" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Guru"}
        </button>
      </div>
    </form>
  );
}