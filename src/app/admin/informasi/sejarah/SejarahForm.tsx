"use client";
import { useState, useTransition } from "react";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, Eye } from "lucide-react";

export default function SejarahForm({ data }: { data: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [isi, setIsi] = useState(data?.isi ?? "");
  const [judul, setJudul] = useState(data?.judul ?? "Sejarah MTS Al-Amin Bintaro");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {data?.idInfo && <input type="hidden" name="idInfo" value={data.idInfo} />}
      <input type="hidden" name="kategori" value="sejarah" />

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Section</label>
          <input
            name="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Contoh: Sejarah MTS Al-Amin Bintaro"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Konten Sejarah</label>
            <button type="button" onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700">
              <Eye className="w-3.5 h-3.5" />
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="border border-gray-200 rounded-lg p-4 min-h-48 prose prose-sm max-w-none bg-gray-50">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{isi || "Belum ada konten"}</p>
            </div>
          ) : (
            <textarea
              name="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Tuliskan sejarah sekolah di sini..."
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Foto (opsional)</label>
          <input
            name="gambar"
            defaultValue={data?.gambar ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="/images/gedung-sekolah.jpg"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <Save className="w-4 h-4" />
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
