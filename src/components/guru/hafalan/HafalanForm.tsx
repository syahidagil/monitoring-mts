"use client";

import { useState, useTransition, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);

  // State untuk menghitung juz otomatis dari surat + ayat mulai/selesai
  const [nomorSurat, setNomorSurat] = useState<number>(0);
  const [ayatMulai, setAyatMulai] = useState<number>(0);
  const [ayatSelesai, setAyatSelesai] = useState<number>(0);
  const [halaman, setHalaman] = useState<string>("");
  const [nilai, setNilai] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");

  const suratTerpilih = nomorSurat ? SURAT_BY_NOMOR[nomorSurat] : undefined;
  const juzOtomatis = nomorSurat && ayatMulai ? hitungJuz(nomorSurat, ayatMulai) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!suratTerpilih) {
      setError("Silakan pilih surat terlebih dahulu");
      return;
    }
    if (!juzOtomatis || !ayatMulai || !ayatSelesai) {
      setError("Isi rentang ayat (ayat mulai dan ayat selesai)");
      return;
    }
    if (ayatSelesai < ayatMulai) {
      setError("Ayat selesai tidak boleh lebih kecil dari ayat mulai");
      return;
    }

    const rentangText = ayatMulai === ayatSelesai ? `Ayat ${ayatMulai}` : `Ayat ${ayatMulai}-${ayatSelesai}`;
    const namaSuratLengkap = `${suratTerpilih.namaLatin} (${rentangText})`;

    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    fd.set("surat", namaSuratLengkap);
    fd.set("juz", String(juzOtomatis));

    startTransition(async () => {
      const result = await createHafalan(fd);
      if (result.success) {
        setSuccess(result.message);
        setNomorSurat(0);
        setAyatMulai(0);
        setAyatSelesai(0);
        setHalaman("");
        setNilai("");
        setKeterangan("");
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
      ref={formRef}
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
            onChange={(e) => {
              const no = Number(e.target.value);
              setNomorSurat(no);
              setAyatMulai(1);
              setAyatSelesai(1);
            }}
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

        {/* Rentang Ayat: Ayat Mulai & Ayat Selesai */}
        <div>
          <label className={labelClass}>
            Ayat Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={suratTerpilih?.jumlahAyat ?? 286}
            required
            value={ayatMulai || ""}
            onChange={(e) => {
              const val = Number(e.target.value);
              setAyatMulai(val);
              if (ayatSelesai && val > ayatSelesai) {
                setAyatSelesai(val);
              }
            }}
            className={inputClass}
            placeholder="mis. 1"
          />
        </div>

        <div>
          <label className={labelClass}>
            Ayat Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={ayatMulai || 1}
            max={suratTerpilih?.jumlahAyat ?? 286}
            required
            value={ayatSelesai || ""}
            onChange={(e) => setAyatSelesai(Number(e.target.value))}
            className={inputClass}
            placeholder="mis. 10"
          />
          {suratTerpilih && (
            <p className="text-xs text-gray-400 mt-1">
              Maks {suratTerpilih.jumlahAyat} ayat
            </p>
          )}
        </div>

        {/* Juz otomatis (read-only) */}
        <div className="col-span-2">
          <label className={labelClass}>Juz (otomatis)</label>
          <input type="hidden" name="juz" value={juzOtomatis ?? ""} />
          <div
            className={`${inputClass} flex items-center ${
              juzOtomatis ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {juzOtomatis ? `Juz ${juzOtomatis}` : "otomatis dari surat + ayat mulai"}
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
            value={halaman}
            onChange={(e) => setHalaman(e.target.value)}
            className={inputClass}
            placeholder="1-604"
          />
        </div>

        {/* Nilai: L / L- */}
        <div>
          <label className={labelClass}>
            Nilai <span className="text-red-500">*</span>
          </label>
          <select
            name="nilai"
            required
            value={nilai}
            onChange={(e) => setNilai(e.target.value)}
            className={inputClass}
          >
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
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
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