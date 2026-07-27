"use client";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  label?: string;
  folder?: string;
};

export default function ImageUploader({
  value = "",
  onChange,
  name = "gambar",
  label = "Foto / Gambar",
  folder = "content",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.filePath);
      } else {
        setError(data.error || "Gagal mengunggah gambar.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat mengunggah gambar.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    onChange("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1 font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "Unggah dari laptop" : "Gunakan URL langsung"}
        </button>
      </div>

      {/* Hidden input agar form bawaan tetap dapat mengambil value */}
      <input type="hidden" name={name} value={value} />

      {error && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
          {error}
        </p>
      )}

      {/* Preview jika sudah ada URL/file */}
      {value ? (
        <div className="relative group w-full max-w-sm h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm flex items-center justify-center">
          {value.startsWith("http") || value.startsWith("/") ? (
            <Image
              src={value}
              alt="Preview foto"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="p-4 text-center text-xs text-gray-500 break-all">{value}</div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow"
            >
              <Upload className="w-3.5 h-3.5" /> Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow"
            >
              <X className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        /* Form URL langsung */
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/foto.jpg atau /images/foto.jpg"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        /* Box Upload dari Laptop */
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed border-gray-300 hover:border-green-600 bg-gray-50 hover:bg-green-50/50 rounded-xl p-6 text-center cursor-pointer transition-all ${
            loading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
              <p className="text-xs font-medium text-gray-600">Mengunggah foto dari laptop...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#1B5E20]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Klik untuk memilih foto dari laptop</p>
                <p className="text-xs text-gray-400 mt-0.5">Format: JPG, PNG, WEBP, GIF (Maks. 10MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input File Tersembunyi */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
