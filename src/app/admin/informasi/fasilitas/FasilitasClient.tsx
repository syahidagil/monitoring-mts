"use client";
import { useState, useTransition } from "react";
import { upsertSchoolInfo, deleteSchoolInfo } from "@/actions/schoolInfo";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";
import ImageUploader from "@/components/admin/shared/ImageUploader";
import Image from "next/image";

export default function FasilitasClient({ fasilitas }: { fasilitas: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState({ judul: "", isi: "", gambar: "" });

  function openAdd() {
    setEditData(null);
    setForm({ judul: "", isi: "", gambar: "" });
    setShowModal(true);
  }

  function openEdit(item: any) {
    setEditData(item);
    setForm({ judul: item.judul, isi: item.isi, gambar: item.gambar ?? "" });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("kategori", "fasilitas");
    fd.append("judul", form.judul);
    fd.append("isi", form.isi);
    fd.append("gambar", form.gambar);
    if (editData?.idInfo) fd.append("idInfo", String(editData.idInfo));

    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      if (result.success) setShowModal(false);
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleDelete(idInfo: number) {
    if (!confirm("Hapus fasilitas ini?")) return;
    startTransition(async () => {
      const result = await deleteSchoolInfo(idInfo);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Fasilitas
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Foto</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Fasilitas</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fasilitas.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Belum ada fasilitas</td></tr>
            )}
            {fasilitas.map((item) => (
              <tr key={item.idInfo} className="hover:bg-gray-50">
                <td className="px-5 py-4 w-20">
                  {item.gambar ? (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-100">
                      <Image src={item.gambar} alt={item.judul} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{item.judul}</td>
                <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">{item.isi}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.idInfo)}
                      className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900">{editData ? "Edit Fasilitas" : "Tambah Fasilitas"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Fasilitas</label>
                <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Laboratorium Komputer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <textarea value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Deskripsi singkat fasilitas..." />
              </div>

              {/* Component Upload Foto Fasilitas */}
              <ImageUploader
                label="Foto Fasilitas (opsional)"
                value={form.gambar}
                onChange={(url) => setForm((prev) => ({ ...prev, gambar: url }))}
                folder="fasilitas"
              />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  <Save className="w-4 h-4" />
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
