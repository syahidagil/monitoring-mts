"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTahunPelajaran, updateTahunPelajaran } from "@/actions/tahunAjaran.action";
import { Save, ArrowLeft, Moon, Sun, Info, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type Props = { defaultValues?: any; isEdit?: boolean; taId?: number };

export default function TahunPelajaranForm({ defaultValues, isEdit, taId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [semester, setSemester] = useState<"GANJIL" | "GENAP">(defaultValues?.semester ?? "GANJIL");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const fd = new FormData(e.currentTarget);
    fd.set("semester", semester);
    startTransition(async () => {
      const result = isEdit && taId
        ? await updateTahunPelajaran(taId, fd)
        : await createTahunPelajaran(fd);
      if (result.success) {
        setSuccess(result.message);
        if (isEdit) setTimeout(() => router.push("/admin/tahun-pelajaran"), 1200);
        else (e.target as HTMLFormElement).reset();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">{success}</p>
          <button type="button" onClick={() => setSuccess("")} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Field 1 — Tahun Pelajaran */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Tahun Pelajaran <span className="text-red-500">*</span>
          </label>
          <input
            name="nama"
            defaultValue={defaultValues?.nama}
            required
            placeholder="Contoh: 2025/2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            Gunakan format YYYY/YYYY (misal: 2025/2026)
          </p>
        </div>

        {/* Field 2 — Semester Radio Card */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Pilih Semester Aktif <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Card Ganjil */}
            <button
              type="button"
              onClick={() => setSemester("GANJIL")}
              className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                semester === "GANJIL"
                  ? "border-green-700 bg-white ring-2 ring-green-100"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  semester === "GANJIL" ? "border-green-700" : "border-gray-300"
                }`}>
                  {semester === "GANJIL" && (
                    <div className="w-2 h-2 rounded-full bg-green-700" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${semester === "GANJIL" ? "text-green-800" : "text-gray-600"}`}>
                    Ganjil
                  </p>
                  <p className="text-xs text-gray-400">Jul — Des</p>
                </div>
              </div>
              <Moon className={`w-5 h-5 flex-shrink-0 ${semester === "GANJIL" ? "text-green-600" : "text-gray-300"}`} />
            </button>

            {/* Card Genap */}
            <button
              type="button"
              onClick={() => setSemester("GENAP")}
              className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                semester === "GENAP"
                  ? "border-green-700 bg-white ring-2 ring-green-100"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  semester === "GENAP" ? "border-green-700" : "border-gray-300"
                }`}>
                  {semester === "GENAP" && (
                    <div className="w-2 h-2 rounded-full bg-green-700" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${semester === "GENAP" ? "text-green-800" : "text-gray-600"}`}>
                    Genap
                  </p>
                  <p className="text-xs text-gray-400">Jan — Jun</p>
                </div>
              </div>
              <Sun className={`w-5 h-5 flex-shrink-0 ${semester === "GENAP" ? "text-yellow-500" : "text-gray-300"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">* Wajib diisi</p>
        <div className="flex gap-3">
          <Link href="/admin/tahun-pelajaran"
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 bg-green-800 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" />{isEdit ? "Simpan Perubahan" : "Simpan Tahun Pelajaran"}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}