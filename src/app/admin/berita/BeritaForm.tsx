"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BeritaForm({ data }: { data?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      if (result.success) {
        router.push("/admin/berita");
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {data?.idInfo && <input type="hidden" name="idInfo" value={data.idInfo} />}
      <input type="hidden" name="kategori" value="berita" />

      {message && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Berita <span className="text-red-500">*</span></label>
          <input name="judul" defaultValue={data?.judul ?? ""} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Masukkan judul berita..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Isi Berita <span className="text-red-500">*</span></label>
          <textarea name="isi" defaultValue={data?.isi ?? ""} required rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Tulis isi berita di sini..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Foto (opsional)</label>
          <input name="gambar" defaultValue={data?.gambar ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://... atau /images/berita.jpg" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/berita" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : "Simpan Berita"}
        </button>
      </div>
    </form>
  );
}
