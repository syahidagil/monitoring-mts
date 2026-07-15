"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createKelas, updateKelas } from "@/actions/kelas.action";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Props = { tahunAjaran: any[]; guru: any[]; defaultValues?: any; isEdit?: boolean; kelasId?: number };

export default function KelasForm({ tahunAjaran, guru, defaultValues, isEdit, kelasId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && kelasId ? await updateKelas(kelasId, fd) : await createKelas(fd);
      if (result.success) router.push("/admin/data-kelas");
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nama Kelas <span className="text-red-500">*</span></label>
            <input name="nama" defaultValue={defaultValues?.nama} required className={inputClass} placeholder="Contoh: 7A, 8B, 9C" />
          </div>
          <div>
            <label className={labelClass}>Tingkat <span className="text-red-500">*</span></label>
            <select name="tingkat" defaultValue={defaultValues?.tingkat ?? "7"} required className={inputClass}>
              <option value="7">Kelas 7</option>
              <option value="8">Kelas 8</option>
              <option value="9">Kelas 9</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tahun Ajaran <span className="text-red-500">*</span></label>
            <select name="tahunAjaranId" defaultValue={defaultValues?.tahunAjaranId} required className={inputClass}>
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunAjaran.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} - {ta.semester} {ta.aktif ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Wali Kelas</label>
            <select name="waliKelasId" defaultValue={defaultValues?.waliKelasId ?? ""} className={inputClass}>
              <option value="">-- Pilih Wali Kelas --</option>
              {guru.map((g) => (
                <option key={g.id} value={g.id}>{g.user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link href="/admin/data-kelas" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kelas"}
        </button>
      </div>
    </form>
  );
}