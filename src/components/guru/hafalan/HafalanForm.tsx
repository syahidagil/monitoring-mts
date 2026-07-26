"use client";

import { useState, useTransition } from "react";
import { createHafalan } from "@/actions/guru/hafalan.action";
import { DAFTAR_SURAT, SURAT_BY_NOMOR, hitungJuz } from "@/lib/quran/surat";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const NILAI_OPTIONS = [
  { value: "L",     label: "L — Lancar",            color: "bg-green-100 text-green-700" },
  { value: "L_MIN", label: "L- — Lancar (catatan)", color: "bg-amber-100 text-amber-700" },
];

export default function HafalanForm({
  siswaId,
  siswaName,
}: {
  siswaId: number;
  siswaName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // State untuk menghitung juz otomatis dari surat + ayat
  const [nomorSurat, setNomorSurat] = useState<number>(0);
  const [ayat, setAyat] = useState<number>(0);

  const suratTerpilih = nomorSurat ? SURAT_BY_NOMOR[nomorSurat] : undefined;
  const juzOtomatis = nomorSurat && ayat ? hitungJuz(nomorSurat, ayat) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!suratTerpilih) {
      setError("Silakan pilih surat terlebih dahulu");
      return;
    }
    if (!juzOtomatis) {
      setError("Isi ayat agar juz dapat dihitung");
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    fd.set("surat", suratTerpilih.namaLatin);
    fd.set("juz", String(juzOtomatis));

    startTransition(async () => {
      const result = await createHafalan(fd);
      if (result.success) {
        setSuccess(result.message);
        (e.target as HTMLFormElement).reset();
        setNomorSurat(0);
        setAyat(0);
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
    >
      <h3 className="font-bold text-gray-800 text-sm pb-3 border-b border-gray-100">
        Input Hafalan — {siswaName}
      </h3>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Surat: dropdown 114 surat dari surat.ts */}
        <div className="col-span-2">
          <label className={labelClass}>
            Surat <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="nomorSurat" value={nomorSurat || ""} />
          <select
            required
            value={nomorSurat || ""}
            onChange={(e) => setNomorSurat(Number(e.target.value))}
            className={inputClass}
          >
            <option value="">Pilih Surat</option>
            {DAFTAR_SURAT.map((s) => (
              <option key={s.nomor} value={s.nomor}>
                {s.nomor}. {s.namaLatin} ({s.jumlahAyat} ayat)
              </option>
            ))}
          </select>
        </div>

        {/* Ayat: dipakai untuk menghitung juz otomatis */}
        <div>
          <label className={labelClass}>
            Ayat ke- <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={suratTerpilih?.jumlahAyat ?? 286}
            required
            value={ayat || ""}
            onChange={(e) => setAyat(Number(e.target.value))}
            className={inputClass}
            placeholder="mis. 5"
          />
          {suratTerpilih && (
            <p className="text-xs text-gray-400 mt-1">
              Maks {suratTerpilih.jumlahAyat} ayat
            </p>
          )}
        </div>

        {/* Juz otomatis (read-only) */}
        <div>
          <label className={labelClass}>Juz (otomatis)</label>
          <input type="hidden" name="juz" value={juzOtomatis ?? ""} />
          <div
            className={`${inputClass} flex items-center ${
              juzOtomatis ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {juzOtomatis ? `Juz ${juzOtomatis}` : "otomatis dari surat + ayat"}
          </div>
        </div>

        {/* Halaman mushaf */}
        <div>
          <label className={labelClass}>
            Halaman <span className="text-red-500">*</span>
          </label>
          <input
            name="halaman"
            type="number"
            min={1}
            max={604}
            required
            className={inputClass}
            placeholder="1-604"
          />
        </div>

        {/* Nilai: L / L- */}
        <div>
          <label className={labelClass}>
            Nilai <span className="text-red-500">*</span>
          </label>
          <select name="nilai" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Pilih nilai
            </option>
            {NILAI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Catatan</label>
          <textarea
            name="keterangan"
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Catatan tambahan (opsional)..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Simpan Hafalan
          </>
        )}
      </button>
    </form>
  );
}