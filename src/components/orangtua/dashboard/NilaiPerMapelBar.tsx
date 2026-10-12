import Link from "next/link";

// Grafik batang horizontal: nilai akhir (PH 67% + PAT 33%) per mata pelajaran.
// Angkanya datang dari getNilaiAnak - fungsi yang sama dengan halaman Nilai
// orang tua - jadi selalu cocok dengan halaman itu dan dengan Rekap Nilai guru.

type Item = {
  kodeMapel: string;
  namaMapel: string;
  rataRata: number; // nilai akhir
  lengkap: boolean; // false = UAS belum diisi (nilai sementara)
};

function warna(n: number) {
  if (n >= 80) return { bar: "bg-emerald-500", teks: "text-emerald-700" };
  if (n >= 70) return { bar: "bg-amber-400", teks: "text-amber-600" };
  return { bar: "bg-rose-500", teks: "text-rose-600" };
}

export default function NilaiPerMapelBar({
  items,
  siswaId,
}: {
  items: Item[];
  siswaId?: number;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-10">Belum ada nilai.</p>;
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((m) => {
          const w = warna(m.rataRata);
          const lebar = Math.max(0, Math.min(100, m.rataRata));
          return (
            <div key={m.kodeMapel} className="flex items-center gap-3">
              <span className="w-28 sm:w-36 shrink-0 text-xs text-gray-700 truncate" title={m.namaMapel}>
                {m.namaMapel}
              </span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${w.bar}`} style={{ width: `${lebar}%` }} />
              </div>
              <span className={`w-14 shrink-0 text-right text-sm font-bold ${w.teks}`}>
                {m.rataRata.toFixed(1)}
                {!m.lengkap && (
                  <span className="block text-[9px] font-normal text-amber-500">sementara</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 80 ke atas
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 70-79
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> di bawah 70
          </span>
        </div>
        {siswaId && (
          <Link
            href={`/orangtua/nilai?siswaId=${siswaId}`}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Lihat rincian nilai
          </Link>
        )}
      </div>
    </div>
  );
}
