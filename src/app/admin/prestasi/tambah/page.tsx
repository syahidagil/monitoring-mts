"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TambahPrestasiPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ judul: "", kategori: "Akademik", tingkat: "", tahun: new Date().getFullYear().toString() });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul || !form.tingkat) { setMessage("Semua field wajib diisi"); return; }
    const fd = new FormData();
    fd.append("kategori", "prestasi");
    fd.append("judul", form.judul);
    fd.append("isi", `${form.kategori}|${form.tingkat}|${form.tahun}`);
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      if (result.success) router.push("/admin/prestasi");
      else setMessage(result.message);
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Prestasi</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah data prestasi baru</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{message}</div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Prestasi <span className="text-red-500">*</span></label>
            <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: Juara 1 Olimpiade Matematika" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {["Akademik", "Non-Akademik", "Islami", "Nasional"].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
              <input value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="2024" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tingkat <span className="text-red-500">*</span></label>
            <input value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: e.target.value })} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: Tingkat Kota Tangerang Selatan" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link href="/admin/prestasi" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <Save className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Simpan Prestasi"}
          </button>
        </div>
      </form>
    </div>
  );
}
