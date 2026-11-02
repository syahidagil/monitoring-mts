"use client";
import { useState } from "react";
import { BookMarked } from "lucide-react";
import type { ProgresHafalanResult } from "@/lib/hafalan/progress";

const RADIUS = 54;
const KELILING = 2 * Math.PI * RADIUS;

export default function HafalanProgressChart({
  progres,
}: {
  progres: ProgresHafalanResult;
}) {
  const {
    perJuz,
    juzAktif,
    jumlahJuzTuntas,
    totalAyatBerhasil,
    totalAyatQuran,
    persentase,
    jumlahRentangBelumTuntas,
  } = progres;

  // Hanya juz yang sudah ada setorannya yang ditampilkan.
  const juzBerisi = perJuz.filter((j) => j.adaSetoran);

  // Bawaan: juz dari setoran terbaru, sampai pengguna memilih juz lain.
  const [pilihan, setPilihan] = useState<number | null>(null);
  const juzDipilih = pilihan ?? juzAktif ?? juzBerisi[0]?.juz ?? null;
  const data = juzDipilih ? perJuz[juzDipilih - 1] : null;

  // Donut chart pakai stroke-dasharray, tanpa dependency chart library.
  const dashOffset = data
    ? KELILING * (1 - Math.min(data.persentase, 100) / 100)
    : KELILING;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookMarked className="w-4 h-4 text-green-700" />
        <h3 className="font-bold text-gray-800 text-sm">Progres Hafalan Al-Qur'an per Juz</h3>
      </div>

      {!data ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          Belum ada setoran hafalan. Progres akan tampil per juz setelah guru menginput setoran.
        </p>
      ) : (
        <>
          {/* Pilih juz */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {juzBerisi.map((j) => (
              <button
                key={j.juz}
                type="button"
                aria-pressed={j.juz === data.juz}
                onClick={() => setPilihan(j.juz)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  j.juz === data.juz
                    ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Juz {j.juz}
              </button>
            ))}
          </div>

          {/* Juz yang dipilih */}
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r={RADIUS}
                  fill="none" stroke="#1B5E20" strokeWidth="12"
                  strokeDasharray={KELILING}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{data.persentase}%</span>
                <span className="text-[10px] text-gray-400">Juz {data.juz}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900">{data.ayatBerhasil}</span>
                <span className="text-xs text-gray-500">
                  / {data.totalAyat} ayat di Juz {data.juz} berhasil dihafal
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Persentase dihitung dari ayat yang{" "}
                <span className="font-medium text-gray-500">evaluasi terbarunya lulus (L)</span>{" "}
                dibagi jumlah ayat pada juz ini. Ayat yang evaluasi terbarunya L- tidak dihitung
                sampai diulang dan mendapat nilai L.
              </p>
            </div>
          </div>

          {/* Perkembangan semua juz */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Perkembangan tiap juz
            </p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {juzBerisi.map((j) => (
                <button
                  key={j.juz}
                  type="button"
                  onClick={() => setPilihan(j.juz)}
                  className={`w-full text-left rounded-lg px-2 py-1.5 transition-colors ${
                    j.juz === data.juz ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">Juz {j.juz}</span>
                    <span className="text-gray-500">
                      {j.ayatBerhasil}/{j.totalAyat} ayat ({j.persentase}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B5E20] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(j.persentase, 100)}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ringkasan keseluruhan */}
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-1">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{jumlahJuzTuntas}</span> dari 30 juz tuntas.
              Total <span className="font-semibold text-gray-700">{totalAyatBerhasil}</span> dari{" "}
              {totalAyatQuran} ayat ({persentase}% dari seluruh Al-Qur'an).
            </p>
            {jumlahRentangBelumTuntas > 0 && (
              <p className="text-xs text-amber-600">
                {jumlahRentangBelumTuntas} rentang setoran belum dihitung karena evaluasi terbarunya masih L-.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}