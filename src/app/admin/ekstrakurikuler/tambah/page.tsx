"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TambahEskulPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ judul: "", jadwal: "", pembina: "", deskripsi: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul || !form.jadwal || !form.pembina) { setMessage("Nama, jadwal, dan pembina wajib diisi"); return; }
    const fd = new FormData();
    fd.append("kategori", "ekstrakurikuler");
    fd.append("judul", form.judul);
    fd.append("isi", `${form.jadwal}|${form.pembina}|${form.deskripsi}`);
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      if (result.success) router.push("/admin/ekstrakurikuler");
      else setMessage(result.message);
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Ekstrakurikuler</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah data ekstrakurikuler baru</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{message}</div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Ekstrakurikuler <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: Tahfidz Al-Quran" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jadwal <span className="text-red-500">*</span></label>
              <input value={form.jadwal} onChange={(e) => setForm({ ...form, jadwal: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Contoh: Senin & Rabu 14:00-16:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pembina <span className="text-red-500">*</span></label>
              <input value={form.pembina} onChange={(e) => setForm({ ...form, pembina: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama pembina" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Deskripsi singkat kegiatan ekstrakurikuler..." />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link href="/admin/ekstrakurikuler" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <Save className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Simpan Ekstrakurikuler"}
          </button>
        </div>
      </form>
    </div>
  );
}
