"use client";

import { hitungNilaiRapor } from "@/lib/nilai/rapor";

type NilaiEntry = { jenis: string; nilai: number };

const JENIS_COLOR: Record<string, string> = {
  HARIAN: "#2563EB",
  UTS: "#7C3AED",
  UAS: "#DC2626",
  TUGAS: "#D97706",
  PR: "#0891B2",
  PRAKTIK: "#16A34A",
};

const JENIS_LABEL: Record<string, string> = {
  HARIAN: "Harian",
  UTS: "UTS",
  UAS: "UAS",
  TUGAS: "Tugas",
  PR: "PR",
  PRAKTIK: "Praktik",
};

export default function NilaiChart({ nilaiList }: { nilaiList: NilaiEntry[] }) {
  if (nilaiList.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">Belum ada nilai untuk siswa ini.</p>;
  }

  // Rata-rata per jenis (satu jenis bisa muncul lebih dari sekali sepanjang semester).
  const perJenis = new Map<string, number[]>();
  for (const n of nilaiList) {
    if (!perJenis.has(n.jenis)) perJenis.set(n.jenis, []);
    perJenis.get(n.jenis)!.push(n.nilai);
  }
  const bars = Array.from(perJenis.entries()).map(([jenis, vals]) => ({
    jenis,
    rata: vals.reduce((a, b) => a + b, 0) / vals.length,
    jumlah: vals.length,
  }));

  const rapor = hitungNilaiRapor(nilaiList);

  const chartH = 180;
  const barMax = 100; // skala nilai tetap 0-100 supaya perbandingan antar siswa konsisten
  const garisAcuan = rapor.nilaiAkhir ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {rapor.nilaiAkhir ?? "-"}
          </p>
          <p className="text-xs text-gray-400">
            Nilai Akhir {!rapor.lengkap && <span className="text-amber-500">(sementara, PAT belum diisi)</span>}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            PH: {rapor.rataPH ?? "-"} &times; 67% + PAT: {rapor.nilaiPAT ?? "-"} &times; 33%
          </p>
        </div>
      </div>

      <div className="relative" style={{ height: chartH + 30 }}>
        {/* Garis nilai akhir */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
          style={{ bottom: (garisAcuan / barMax) * chartH + 30 }}
        >
          <span className="absolute -top-4 right-0 text-[10px] text-gray-400">
            nilai akhir: {rapor.nilaiAkhir ?? "-"}
          </span>
        </div>

        <div className="flex items-end justify-around h-full gap-3 px-2">
          {bars.map((b) => (
            <div key={b.jenis} className="flex flex-col items-center flex-1 h-full justify-end">
              <span className="text-xs font-semibold text-gray-700 mb-1">{b.rata.toFixed(1)}</span>
              <div
                className="w-full max-w-10 rounded-t-md transition-all"
                style={{
                  height: `${(b.rata / barMax) * chartH}px`,
                  backgroundColor: JENIS_COLOR[b.jenis] ?? "#9CA3AF",
                }}
              />
              <span className="text-[11px] text-gray-500 mt-2 text-center">
                {JENIS_LABEL[b.jenis] ?? b.jenis}
              </span>
              <span className="text-[10px] text-gray-400">
                {b.jenis === "UAS" ? "PAT" : "PH"} &middot; {b.jumlah}x
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Setiap batang adalah rata-rata nilai untuk satu jenis penilaian. Garis putus-putus
        menunjukkan Nilai Akhir sesuai skema rapor (PH 67% + PAT 33%).
      </p>
    </div>
  );
}
