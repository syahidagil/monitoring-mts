"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMapel, updateMapel } from "@/actions/mapel.action";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Props = { defaultValues?: any; isEdit?: boolean };

export default function MapelForm({ defaultValues, isEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit
        ? await updateMapel(defaultValues.kodeMapel, fd)
        : await createMapel(fd);
      if (result.success) router.push("/admin/mata-pelajaran");
      else setMessage({ type: "error", text: result.message });
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {message && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{message.text}</div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className={labelClass}>
            Kode Mapel <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(maks. 5 karakter, otomatis kapital)</span>
          </label>
          <input name="kodeMapel" defaultValue={defaultValues?.kodeMapel} required maxLength={5}
            disabled={isEdit}
            onChange={(e) => e.target.value = e.target.value.toUpperCase()}
            className={`${inputClass} uppercase font-mono ${isEdit ? "bg-gray-100" : ""}`}
            placeholder="Contoh: MTK" />
        </div>
        <div>
          <label className={labelClass}>Nama Mata Pelajaran <span className="text-red-500">*</span></label>
          <input name="namaMapel" defaultValue={defaultValues?.namaMapel} required maxLength={20}
            className={inputClass} placeholder="Contoh: Matematika" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link href="/admin/mata-pelajaran" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Mapel"}
        </button>
      </div>
    </form>
  );
}