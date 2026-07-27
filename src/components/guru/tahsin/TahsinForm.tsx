"use client";

import { useState, useTransition } from "react";
import { createTahsin } from "@/actions/guru/tahsin.action";
import { DAFTAR_SURAT, SURAT_BY_NOMOR, hitungJuz } from "@/lib/quran/surat";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const ASPEK = [
  { name: "tajwid", label: "Tajwid" },
  { name: "makhraj", label: "Makhraj" },
  { name: "sifatul", label: "Sifatul Huruf" },
] as const;

const NILAI_OPTIONS = [
  { value: "L", label: "L" },
  { value: "L_MIN", label: "L-" },
];

export default function TahsinForm({
  siswaId,
  siswaName,
}: {
  siswaId: number;
  siswaName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [nomorSurat, setNomorSurat] = useState<number>(0);
  const [ayatMulai, setAyatMulai] = useState<number>(0);
  const [ayatSelesai, setAyatSelesai] = useState<number>(0);

  const suratTerpilih = nomorSurat ? SURAT_BY_NOMOR[nomorSurat] : undefined;
  const juzOtomatis = nomorSurat && ayatMulai ? hitungJuz(nomorSurat, ayatMulai) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!suratTerpilih) return setError("Silakan pilih surat terlebih dahulu");
    if (!juzOtomatis || !ayatMulai || !ayatSelesai) {
      return setError("Isi rentang ayat (ayat mulai dan ayat selesai)");
    }
    if (ayatSelesai < ayatMulai) {
      return setError("Ayat selesai tidak boleh lebih kecil dari ayat mulai");
    }

    const rentangText = ayatMulai === ayatSelesai ? `Ayat ${ayatMulai}` : `Ayat ${ayatMulai}-${ayatSelesai}`;
    const namaSuratLengkap = `${suratTerpilih.namaLatin} (${rentangText})`;

    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    fd.set("surat", namaSuratLengkap);
    fd.set("juz", String(juzOtomatis));

    startTransition(async () => {
      const result = await createTahsin(fd);
      if (result.success) {
        setSuccess(result.message);
        (e.target as HTMLFormElement).reset();
        setNomorSurat(0);
        setAyatMulai(0);
        setAyatSelesai(0);
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
        Input Tahsin — {siswaName}
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
        {/* Surat */}
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

        {/* Rentang Ayat */}
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

        {/* Juz otomatis */}
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

        {/* Halaman */}
        <div className="col-span-2">
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

        {/* Penilaian 3 aspek: tajwid, makhraj, sifatul */}
        <div className="col-span-2">
          <label className={labelClass}>
            Penilaian Aspek <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2.5">
            {ASPEK.map((aspek) => (
              <div
                key={aspek.name}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-700">{aspek.label}</span>
                <div className="flex gap-2">
                  {NILAI_OPTIONS.map((o) => (
                    <label key={o.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name={aspek.name}
                        value={o.value}
                        required
                        className="sr-only peer"
                      />
                      <span
                        className="inline-block w-11 text-center py-1.5 rounded-md text-xs font-semibold border-2 border-transparent bg-white text-gray-600 peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-700 transition-all"
                      >
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            L = Lancar, L- = Lancar dengan catatan
          </p>
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
            Simpan Tahsin
          </>
        )}
      </button>
    </form>
  );
}