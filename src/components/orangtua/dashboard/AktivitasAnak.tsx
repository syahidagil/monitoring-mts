import { Calendar, TrendingUp } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  HADIR:"bg-green-100 text-green-700", SAKIT:"bg-blue-100 text-blue-700",
  IZIN:"bg-yellow-100 text-yellow-700", ALPHA:"bg-red-100 text-red-700",
};

type AbsensiMap = Record<number, Record<string, number>>;
type Anak = { id: number; nama: string; kelas: { nama: string }; _count: any };

export default function AktivitasAnak({ anak, absensiMap, nilaiTerbaru }: {
  anak: Anak[];
  absensiMap: AbsensiMap;
  nilaiTerbaru: any[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Absensi bulan ini */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-gray-800">Absensi Bulan Ini</h3>
        </div>
        {anak.map((a) => {
          const ab = absensiMap[a.id] ?? { HADIR:0, SAKIT:0, IZIN:0, ALPHA:0 };
          return (
            <div key={a.id} className="mb-4 last:mb-0">
              <p className="text-xs font-semibold text-gray-700 mb-2">{a.nama} — Kelas {a.kelas.nama}</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(ab).map(([s, n]) => (
                  <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[s]}`}>
                    {s[0]}: {n}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nilai terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800">Nilai Terbaru</h3>
        </div>
        {nilaiTerbaru.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Belum ada data nilai</p>
        ) : (
          <div className="space-y-2">
            {nilaiTerbaru.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{n.mapel}</p>
                  <p className="text-xs text-gray-400">{n.siswa.nama} • {n.jenis}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${Number(n.nilai) >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {String(n.nilai)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}