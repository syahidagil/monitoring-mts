import { BookMarked } from "lucide-react";
import type { ProgresHafalanResult } from "@/lib/hafalan/progress";

export default function HafalanProgressChart({
  progres,
}: {
  progres: ProgresHafalanResult;
}) {
  const { persentase, totalAyatBerhasil, totalAyatQuran, jumlahRentangBelumTuntas } = progres;

  // Donut chart pakai stroke-dasharray, tanpa dependency chart library.
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(persentase, 100) / 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookMarked className="w-4 h-4 text-green-700" />
        <h3 className="font-bold text-gray-800 text-sm">Progres Hafalan Al-Qur'an</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60" cy="60" r={radius}
              fill="none" stroke="#E5E7EB" strokeWidth="12"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none" stroke="#1B5E20" strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{persentase}%</span>
            <span className="text-[10px] text-gray-400">hafal</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-900">{totalAyatBerhasil}</span>
            <span className="text-xs text-gray-500">/ {totalAyatQuran} ayat berhasil dihafal</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Dihitung dari rentang ayat yang <span className="font-medium text-gray-500">lulus (L) di semua evaluasi</span>.
            Rentang yang pernah mendapat nilai L- tidak ikut dihitung.
          </p>
          {jumlahRentangBelumTuntas > 0 && (
            <p className="text-xs text-amber-600">
              {jumlahRentangBelumTuntas} rentang setoran belum dihitung karena pernah mendapat nilai L-.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}