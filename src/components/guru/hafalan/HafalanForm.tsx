"use client";

import { useState, useTransition, useRef } from "react";
import { createHafalan } from "@/actions/guru/hafalan.action";
import { SURAT_BY_NOMOR } from "@/lib/quran/surat";
import { daftarSuratDiJuz, rentangAyatDiJuz } from "@/lib/quran/juz";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

const NILAI_OPTIONS = [
  { value: "L",     label: "L \u2014 Lancar",            color: "bg-green-100 text-green-700" },
  { value: "L_MIN", label: "L- \u2014 Lancar (catatan)", color: "bg-amber-100 text-amber-700" },
];

const DAFTAR_JUZ = Array.from({ length: 30 }, (_, i) => i + 1);

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

  // Guru memilih juz dulu, lalu surat yang ada di juz itu
  const [juz, setJuz] = useState<number>(0);
  const [nomorSurat, setNomorSurat] = useState<number>(0);
  const [ayatMulai, setAyatMulai] = useState<number>(0);
  const [ayatSelesai, setAyatSelesai] = useState<number>(0);
  const [halaman, setHalaman] = useState<string>("");
  const [nilai, setNilai] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");

  const daftarSurat = juz ? daftarSuratDiJuz(juz) : [];
  const suratTerpilih = nomorSurat ? SURAT_BY_NOMOR[nomorSurat] : undefined;
  const rentang = juz && nomorSurat ? rentangAyatDiJuz(juz, nomorSurat) : null;
  const suratSebagian = daftarSurat.find((s) => s.nomor === nomorSurat)?.sebagian ?? false;

  function handleJuzChange(value: string) {
    setJuz(Number(value));
    // Surat dan ayat harus dipilih ulang karena daftar surat berbeda per juz
    setNomorSurat(0);
    setAyatMulai(0);
    setAyatSelesai(0);
  }

  function handleSuratChange(value: string) {
    const no = Number(value);
    setNomorSurat(no);
    const batas = no ? rentangAyatDiJuz(juz, no) : null;
    setAyatMulai(batas ? batas.mulai : 0);
    setAyatSelesai(batas ? batas.mulai : 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!juz) {
      setError("Silakan pilih juz terlebih dahulu");
      return;
    }
    if (!suratTerpilih || !rentang) {
      setError("Silakan pilih surat terlebih dahulu");
      return;
    }
    if (!ayatMulai || !ayatSelesai) {
      setError("Isi rentang ayat (ayat mulai dan ayat selesai)");
      return;
    }
    if (ayatSelesai < ayatMulai) {
      setError("Ayat selesai tidak boleh lebih kecil dari ayat mulai");
      return;
    }
    if (ayatMulai < rentang.mulai || ayatSelesai > rentang.selesai) {
      setError(`Pada Juz ${juz}, ${suratTerpilih.namaLatin} memuat ayat ${rentang.mulai}-${rentang.selesai}`);
      return;
    }

    const rentangText = ayatMulai === ayatSelesai ? `Ayat ${ayatMulai}` : `Ayat ${ayatMulai}-${ayatSelesai}`;
    const namaSuratLengkap = `${suratTerpilih.namaLatin} (${rentangText})`;

    const fd = new FormData(e.currentTarget);
    fd.set("siswaId", String(siswaId));
    fd.set("surat", namaSuratLengkap);
    fd.set("juz", String(juz));
    fd.set("ayatMulai", String(ayatMulai));
    fd.set("ayatSelesai", String(ayatSelesai));

    startTransition(async () => {
      const result = await createHafalan(fd);
      if (result.success) {
        setSuccess(result.message);
        // Juz sengaja dibiarkan terpilih: guru biasanya lanjut menyetor di juz yang sama
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
        Input Hafalan &mdash; {siswaName}
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
        {/* Juz: dipilih guru */}
        <div className="col-span-2">
          <label className={labelClass}>
            Juz <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="juz" value={juz || ""} />
          <select
            required
            value={juz || ""}
            onChange={(e) => handleJuzChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Pilih Juz</option>
            {DAFTAR_JUZ.map((j) => (
              <option key={j} value={j}>
                Juz {j}
              </option>
            ))}
          </select>
        </div>

        {/* Surat: hanya surat yang ada di juz terpilih */}
        <div className="col-span-2">
          <label className={labelClass}>
            Surat <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="nomorSurat" value={nomorSurat || ""} />
          <select
            required
            disabled={!juz}
            value={nomorSurat || ""}
            onChange={(e) => handleSuratChange(e.target.value)}
            className={inputClass}
          >
            <option value="">{juz ? "Pilih Surat" : "Pilih juz terlebih dahulu"}</option>
            {daftarSurat.map((s) => (
              <option key={s.nomor} value={s.nomor}>
                {s.nomor}. {s.namaLatin} (
                {s.sebagian
                  ? `ayat ${s.ayatMulai}-${s.ayatSelesai} dari ${s.jumlahAyat}`
                  : `${s.jumlahAyat} ayat`}
                )
              </option>
            ))}
          </select>
        </div>

        {/* Rentang Ayat: Ayat Mulai & Ayat Selesai (dibatasi pada juz terpilih) */}
        <div>
          <label className={labelClass}>
            Ayat Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={rentang?.mulai ?? 1}
            max={rentang?.selesai ?? 286}
            required
            disabled={!rentang}
            value={ayatMulai || ""}
            onChange={(e) => {
              const val = Number(e.target.value);
              setAyatMulai(val);
              if (ayatSelesai && val > ayatSelesai) {
                setAyatSelesai(val);
              }
            }}
            className={inputClass}
            placeholder={rentang ? `mis. ${rentang.mulai}` : "mis. 1"}
          />
        </div>

        <div>
          <label className={labelClass}>
            Ayat Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={ayatMulai || rentang?.mulai || 1}
            max={rentang?.selesai ?? 286}
            required
            disabled={!rentang}
            value={ayatSelesai || ""}
            onChange={(e) => setAyatSelesai(Number(e.target.value))}
            className={inputClass}
            placeholder={rentang ? `maks ${rentang.selesai}` : "mis. 10"}
          />
        </div>

        {rentang && (
          <div className="col-span-2 -mt-2">
            <p className="text-xs text-gray-500">
              Pada Juz {juz}, {suratTerpilih?.namaLatin} memuat ayat {rentang.mulai}-{rentang.selesai}.
            </p>
            {suratSebagian && (
              <p className="text-xs text-amber-600 mt-0.5">
                Surat ini berlanjut ke juz lain. Setoran yang melewati batas juz dicatat sebagai dua setoran.
              </p>
            )}
          </div>
        )}

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