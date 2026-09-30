"use client";

type Props = {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
};

const SEGMEN = [
  { key: "hadir", label: "Hadir", color: "#16A34A" },
  { key: "sakit", label: "Sakit", color: "#2563EB" },
  { key: "izin", label: "Izin", color: "#D97706" },
  { key: "alpa", label: "Alpa", color: "#DC2626" },
] as const;

export default function AbsensiChart({ hadir, sakit, izin, alpa }: Props) {
  const total = hadir + sakit + izin + alpa;

  if (total === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">Belum ada data absensi untuk siswa ini.</p>;
  }

  const nilai = { hadir, sakit, izin, alpa };
  const pctHadir = Math.round((hadir / total) * 1000) / 10;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Susun tiap segmen berurutan di sekeliling lingkaran (stroke-dasharray per segmen).
  let cursor = 0;
  const segments = SEGMEN.map((s) => {
    const value = nilai[s.key];
    const fraction = value / total;
    const dash = fraction * circumference;
    const offset = circumference * (1 - cursor);
    cursor += fraction;
    return { ...s, value, fraction, dash, offset };
  }).filter((s) => s.value > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="14" />
            {segments.map((s) => (
              <circle
                key={s.key}
                cx="60" cy="60" r={radius}
                fill="none" stroke={s.color} strokeWidth="14"
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={s.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{pctHadir}%</span>
            <span className="text-[10px] text-gray-400">hadir</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {SEGMEN.map((s) => {
            const value = nilai[s.key];
            const pct = total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-gray-600 flex-1">{s.label}</span>
                <span className="text-xs font-semibold text-gray-800">{value}</span>
                <span className="text-[11px] text-gray-400 w-12 text-right">{pct}%</span>
              </div>
            );
          })}
          <div className="pt-1.5 mt-1.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Total sesi</span>
            <span className="text-xs font-semibold text-gray-800">{total}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Komposisi kehadiran dari seluruh sesi yang tercatat sesuai filter yang sedang aktif.
      </p>
    </div>
  );
}
