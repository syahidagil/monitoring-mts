"use client";

import { useState, useTransition } from "react";
import { createTahsin } from "@/actions/guru/tahsin.action";
import { DAFTAR_SURAT, SURAT_BY_NOMOR, hitungJuz } from "@/lib/quran/surat";
import {
  BookOpen, Save, CheckCircle, AlertCircle, Calendar, User,
} from "lucide-react";

const ASPEK = [
  { name: "tajwid", label: "Tajwid" },
  { name: "makhraj", label: "Makhraj" },
  { name: "sifatul", label: "Sifatul Huruf" },
] as const;

type Props = {
  siswaId: number;
  siswaNama: string;
  siswaNis: string;
  kelasNama: string;
  namaGuru: string;
  tahunAjaran: string | null;
};

function hariIniISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function TahsinInputForm({
  siswaId, siswaNama, siswaNis, kelasNama, namaGuru, tahunAjaran,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [nomorSurat, setNomorSurat] = useState<number>(0);
  const [ayatMulai, setAyatMulai] = useState<number>(0);
  const [ayatSelesai, setAyatSelesai] = useState<number>(0);
  const [tanggal, setTanggal] = useState(hariIniISO);
  const [halaman, setHalaman] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [aspekVal, setAspekVal] = useState<Record<string, "L" | "L_MIN">>({
    tajwid: "L", makhraj: "L", sifatul: "L",
  });

  const suratTerpilih = nomorSurat ? SURAT_BY_NOMOR[nomorSurat] : undefined;
  const juzOtomatis = nomorSurat && ayatMulai ? hitungJuz(nomorSurat, ayatMulai) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");

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
    fd.set("tajwid", aspekVal.tajwid);
    fd.set("makhraj", aspekVal.makhraj);
    fd.set("sifatul", aspekVal.sifatul);

    startTransition(async () => {
      const result = await createTahsin(fd);
      if (result.success) {
        setSuccess(result.message);
        setNomorSurat(0);
        setAyatMulai(0);
        setAyatSelesai(0);
        setTanggal(hariIniISO());
        setHalaman("");
        setKeterangan("");
        setAspekVal({ tajwid: "L", makhraj: "L", sifatul: "L" });
      } else {
        setError(result.message);
      }
    });
  }

  const inputBase =
    "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";
  const labelBase =
    "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header hijau */}
      <div className="flex items-center justify-between bg-[#1B5E20] px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <BookOpen size={18} />
          <h2 className="font-bold text-sm">Formulir Monitoring Tahsin</h2>
        </div>
        <span className="text-xs font-medium text-emerald-100 uppercase tracking-wide">
          {tahunAjaran ? `Tahun Ajaran ${tahunAjaran}` : "Tahun Ajaran belum diatur"}
        </span>
      </div>

      {(success || error) && (
        <div className="px-6 pt-5">
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Kolom kiri ── */}
          <div className="space-y-4">
            {/* Siswa */}
            <div>
              <label className={labelBase}>Siswa</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                  {siswaNama.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{siswaNama}</p>
                  <p className="text-xs text-gray-400">{siswaNis} &middot; Kelas {kelasNama}</p>
                </div>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label className={labelBase}>Hari &amp; Tanggal</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="tanggal"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  max={hariIniISO()}
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>

            {/* Juz + Halaman */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Juz (otomatis)</label>
                <input type="hidden" name="juz" value={juzOtomatis ?? ""} />
                <div className={`${inputBase} flex items-center ${juzOtomatis ? "text-gray-900" : "text-gray-400"}`}>
                  {juzOtomatis ? `Juz ${juzOtomatis}` : "dari surat+ayat"}
                </div>
              </div>
              <div>
                <label className={labelBase}>Halaman</label>
                <input
                  name="halaman" type="number" min={1} max={604} required
                  value={halaman}
                  onChange={(e) => setHalaman(e.target.value)}
                  className={inputBase} placeholder="Halaman ke-..."
                />
              </div>
            </div>

            {/* Surah + Rentang Ayat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelBase}>Surah</label>
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
                  className={inputBase}
                >
                  <option value="">Pilih Surah</option>
                  {DAFTAR_SURAT.map((s) => (
                    <option key={s.nomor} value={s.nomor}>
                      {s.nomor}. {s.namaLatin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelBase}>Ayat Mulai</label>
                <input
                  type="number" min={1}
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
                  className={inputBase}
                  placeholder="mis. 1"
                />
              </div>
              <div>
                <label className={labelBase}>Ayat Selesai</label>
                <input
                  type="number" min={ayatMulai || 1}
                  max={suratTerpilih?.jumlahAyat ?? 286}
                  required
                  value={ayatSelesai || ""}
                  onChange={(e) => setAyatSelesai(Number(e.target.value))}
                  className={inputBase}
                  placeholder="mis. 10"
                />
              </div>
            </div>
          </div>

          {/* ── Kolom kanan ── */}
          <div className="space-y-4">
            {/* 3 aspek penilaian, tombol L / L- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ASPEK.map((aspek) => (
                <div key={aspek.name}>
                  <label className={labelBase}>{aspek.label}</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(["L", "L_MIN"] as const).map((v) => {
                      const aktif = aspekVal[aspek.name] === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            setAspekVal((prev) => ({ ...prev, [aspek.name]: v }))
                          }
                          className={
                            "flex-1 py-2.5 text-sm font-semibold transition-colors " +
                            (aktif
                              ? "bg-[#1B5E20] text-white"
                              : "bg-white text-gray-500 hover:bg-gray-50")
                          }
                        >
                          {v === "L" ? "L" : "L-"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Keterangan */}
            <div>
              <label className={labelBase}>Keterangan</label>
              <textarea
                name="keterangan"
                rows={4}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className={`${inputBase} resize-none`}
                placeholder="Tambahkan catatan perkembangan atau evaluasi siswa di sini..."
              />
            </div>

            {/* Guru penguji */}
            <div>
              <label className={labelBase}>Guru Penguji</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <div className={`${inputBase} pl-9 bg-gray-50 text-gray-600 italic`}>
                  {namaGuru}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer aksi */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            type="reset"
            onClick={() => {
              setNomorSurat(0); setAyatMulai(0); setAyatSelesai(0);
              setTanggal(hariIniISO());
              setHalaman("");
              setKeterangan("");
              setAspekVal({ tajwid: "L", makhraj: "L", sifatul: "L" });
              setError(""); setSuccess("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}