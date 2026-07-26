"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { saveNilaiBatch } from "@/actions/guru/nilai.action";
import { JENIS_NILAI, JENIS_LABEL, type JenisNilaiInput } from "@/lib/validations/guru/nilai.validation";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  nilaiId: number | null;
  nilai: number | null;
  keterangan: string;
};

function hariIniISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function NilaiInputGrid({
  jadwalId,
  jenisAktif,
  siswa,
}: {
  jadwalId: number;
  jenisAktif: JenisNilaiInput;
  siswa: Siswa[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sudahTerisi = siswa.filter((s) => s.nilai !== null).length;

  // Ganti jenis -> reload via query param (server ambil nilai existing)
  function gantiJenis(j: string) {
    router.push(`${pathname}?jenis=${j}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);
    fd.set("jadwalId", String(jadwalId));
    fd.set("jenis", jenisAktif);

    startTransition(async () => {
      const res = await saveNilaiBatch(fd);
      if (res.success) {
        setSuccess(res.message);
        router.refresh(); // muat ulang nilai existing + riwayat
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-[#1B5E20] px-6 py-4">
        <h2 className="text-white font-bold text-sm">Formulir Input Nilai</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Kontrol atas: jenis, tanggal, keterangan */}
        <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Jenis Penilaian
            </label>
            <select
              value={jenisAktif}
              onChange={(e) => gantiJenis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {JENIS_NILAI.map((j) => (
                <option key={j} value={j}>
                  {JENIS_LABEL[j]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Tanggal Penilaian
            </label>
            <input
              type="date"
              name="tanggal"
              required
              defaultValue={hariIniISO()}
              max={hariIniISO()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              name="keterangan"
              placeholder="mis. Bab 3 - Aljabar"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {(success || error) && (
          <div className="px-6 pt-4">
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
          </div>
        )}

        <div className="px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {siswa.length} siswa &middot;{" "}
            <span className="text-emerald-600 font-medium">{sudahTerisi} sudah dinilai</span>
          </p>
          <p className="text-xs text-gray-400">
            Kolom terisi berarti nilai sudah ada — mengubahnya akan memperbarui data.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-[11px] text-gray-500 uppercase tracking-wide">
                <th className="text-left font-semibold px-6 py-3 w-12">No</th>
                <th className="text-left font-semibold px-3 py-3">Nama Siswa</th>
                <th className="text-center font-semibold px-3 py-3 w-32">
                  Nilai ({JENIS_LABEL[jenisAktif]})
                </th>
                <th className="text-center font-semibold px-6 py-3 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {siswa.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <td className="px-6 py-3 text-gray-400 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-800">{s.nama}</p>
                    <p className="text-xs text-gray-400">{s.nis}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="number"
                      name={`nilai_${s.id}`}
                      min={0}
                      max={100}
                      step="0.01"
                      defaultValue={s.nilai ?? ""}
                      placeholder="0-100"
                      className="w-24 text-center border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    {s.nilai !== null ? (
                      <span className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                        Terisi
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">Kosong</span>
                    )}
                  </td>
                </tr>
              ))}
              {siswa.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isPending || siswa.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Nilai
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}