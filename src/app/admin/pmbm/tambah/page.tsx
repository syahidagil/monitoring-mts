"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPengumuman } from "@/actions/pmbm";
import { ArrowLeft, Upload, FileText, X, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function TambahPengumumanPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filePath: string; fileName: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(file: File) {
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Format file tidak didukung. Gunakan PDF, JPG, atau PNG" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file maksimal 10MB" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        setUploadedFile({ filePath: data.filePath, fileName: data.fileName });
        setMessage({ type: "success", text: "File berhasil diupload" });
      } else {
        setMessage({ type: "error", text: data.error ?? "Gagal upload file" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan saat upload" });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadedFile) {
      setMessage({ type: "error", text: "Upload file terlebih dahulu" });
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.append("filePath", uploadedFile.filePath);
    fd.append("fileName", uploadedFile.fileName);

    startTransition(async () => {
      const result = await createPengumuman(fd);
      if (result.success) {
        router.push("/admin/pmbm");
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Upload Pengumuman PMBM</h1>
        <p className="text-sm text-gray-500 mt-1">Upload file pengumuman nama-nama siswa yang lolos PMBM</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : null}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Pengumuman <span className="text-red-500">*</span>
            </label>
            <input name="judul" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: Pengumuman Tahap 1 PMBM 2026/2027" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Ajaran <span className="text-red-500">*</span></label>
            <select name="tahun" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="2026/2027">2026/2027</option>
              <option value="2027/2028">2027/2028</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
            <textarea name="deskripsi" rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Keterangan singkat tentang pengumuman ini..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              File Pengumuman <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(PDF, JPG, PNG — maks 10MB)</span>
            </label>

            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileChange(file);
                }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Mengupload file...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                      <Upload className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Klik atau drag file ke sini</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG hingga 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{uploadedFile.fileName}</p>
                  <p className="text-xs text-green-600 mt-0.5">File berhasil diupload</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setUploadedFile(null); setMessage(null); }}
                  className="p-1.5 text-green-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/admin/pmbm" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <button type="submit" disabled={isPending || !uploadedFile || isUploading}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Pengumuman"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
