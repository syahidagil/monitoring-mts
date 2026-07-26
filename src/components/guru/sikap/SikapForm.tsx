"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, AlertCircle, User, Calendar, ChevronDown, X, Search,
} from "lucide-react";
import { createSikap, updateSikap, type SiswaOpsi } from "@/actions/guru/sikap.action";
import {
  KATEGORI_POSITIF, KATEGORI_PELANGGARAN,
} from "@/lib/validations/guru/sikap.validation";

type JenisSikap = "POSITIF" | "PELANGGARAN";

type Existing = {
  id: number;
  siswaId: number;
  siswaLabel: string;
  jenisSikap: JenisSikap;
  kategori: string;
  keterangan: string;
  tanggal: Date;
} | null;

function isoDate(d: Date | string) {
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function SikapForm({
  guruNama,
  periode,
  siswaList,
  existing,
}: {
  guruNama: string;
  periode: string;
  siswaList: SiswaOpsi[];
  existing: Existing;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tanggal, setTanggal] = useState(existing ? isoDate(existing.tanggal) : isoDate(new Date()));
  const [jenis, setJenis] = useState<JenisSikap | "">(existing?.jenisSikap ?? "");
  const [siswaId, setSiswaId] = useState<number | null>(existing?.siswaId ?? null);
  const [siswaLabel, setSiswaLabel] = useState(existing?.siswaLabel ?? "");
  const [kategori, setKategori] = useState(existing?.kategori ?? "");
  const [keterangan, setKeterangan] = useState(existing?.keterangan ?? "");

  const [cari, setCari] = useState("");
  const [bukaDropdown, setBukaDropdown] = useState(false);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const kategoriOpsi = jenis === "POSITIF"
    ? KATEGORI_POSITIF
    : jenis === "PELANGGARAN"
      ? KATEGORI_PELANGGARAN
      : [];

  const hasilCari = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (q.length < 1) return siswaList.slice(0, 8);
    return siswaList
      .filter((s) => s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q))
      .slice(0, 8);
  }, [cari, siswaList]);

  function pilihJenis(j: JenisSikap) {
    setJenis(j);
    setKategori(""); // reset kategori saat ganti jenis
  }

  function pilihSiswa(s: SiswaOpsi) {
    setSiswaId(s.id);
    setSiswaLabel(`${s.nama} - ${s.nis} - ${s.kelasNama}`);
    setCari("");
    setBukaDropdown(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSukses("");

    if (!jenis) return setError("Pilih kategori perilaku (Positif / Pelanggaran)");
    if (!siswaId) return setError("Pilih siswa terlebih dahulu");
    if (!kategori) return setError("Pilih jenis kategori");
    if (keterangan.trim().length < 10) return setError("Keterangan minimal 10 karakter");

    const fd = new FormData();
    fd.set("siswaId", String(siswaId));
    fd.set("jenisSikap", jenis);
    fd.set("kategori", kategori);
    fd.set("keterangan", keterangan.trim());
    fd.set("tanggal", tanggal);

    startTransition(async () => {
      const res = existing
        ? await updateSikap(existing.id, fd)
        : await createSikap(fd);
      if (res.success) {
        setSukses(res.message);
        setTimeout(() => router.push("/guru/sikap"), 1200);
      } else {
        setError(res.message);
      }
    });
  }

  const inputCls =
    "w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300";

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {existing ? "Edit Catatan Sikap Siswa" : "Tambah Catatan Sikap Siswa"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Input pencatatan perilaku positif maupun pelanggaran siswa secara real-time.
            </p>
          </div>
          <Link
            href="/guru/sikap"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} /> Kembali
          </Link>
        </div>

        {sukses && (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">{sukses}</p>
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {/* Info bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <User size={17} className="text-green-700" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Pelapor</p>
                <p className="text-sm font-semibold text-gray-800">{guruNama} (Guru)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={17} className="text-blue-700" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Periode</p>
                <p className="text-sm font-semibold text-gray-800">{periode}</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tanggal Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  max={isoDate(new Date())}
                  className={inputCls}
                />
              </div>

              {/* Jenis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kategori Perilaku <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => pilihJenis("POSITIF")}
                    className={
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all " +
                      (jenis === "POSITIF"
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:bg-green-50")
                    }
                  >
                    <span className="text-base leading-none">+</span> Positif
                  </button>
                  <button
                    type="button"
                    onClick={() => pilihJenis("PELANGGARAN")}
                    className={
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all " +
                      (jenis === "PELANGGARAN"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-red-400 hover:bg-red-50")
                    }
                  >
                    <AlertCircle size={15} /> Pelanggaran
                  </button>
                </div>
              </div>
            </div>

            {/* Siswa searchable */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Siswa - Kelas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {siswaId ? (
                  <div className="flex items-center justify-between border-2 border-green-500 bg-green-50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-green-700" />
                      <span className="text-sm font-medium text-green-800">{siswaLabel}</span>
                    </div>
                    <button type="button" onClick={() => { setSiswaId(null); setSiswaLabel(""); }}>
                      <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={cari}
                      onChange={(e) => { setCari(e.target.value); setBukaDropdown(true); }}
                      onFocus={() => setBukaDropdown(true)}
                      placeholder="Pilih atau cari nama siswa..."
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  </div>
                )}

                {bukaDropdown && !siswaId && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBukaDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                      {hasilCari.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          Siswa tidak ditemukan
                        </div>
                      ) : (
                        hasilCari.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => pilihSiswa(s)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors"
                          >
                            <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {s.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{s.nama}</p>
                              <p className="text-xs text-gray-500">{s.nis} &middot; Kelas {s.kelasNama}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Kategori chips */}
            {jenis && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jenis Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {kategoriOpsi.map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setKategori(kat)}
                      className={
                        "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all " +
                        (kategori === kat
                          ? jenis === "POSITIF"
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-red-600 text-white border-red-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400")
                      }
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Keterangan Detail <span className="text-red-500">*</span>
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="Jelaskan secara detail kejadian atau perilaku yang diobservasi..."
                className={inputCls + " resize-none"}
              />
              <div className="flex items-start justify-between mt-1">
                <p className="text-xs text-gray-400">
                  Tuliskan kronologi singkat, waktu spesifik, dan dampak perilaku tersebut.
                </p>
                <p className={"text-xs shrink-0 " + (keterangan.length < 10 ? "text-gray-400" : "text-green-600")}>
                  {keterangan.length}/500
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/guru/sikap"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending || !!sukses}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-800 hover:bg-green-900 disabled:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Simpan Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}