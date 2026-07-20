import Link from "next/link";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const HARI_MAP: Record<string, number> = {
  MINGGU:0, SENIN:1, SELASA:2, RABU:3, KAMIS:4, JUMAT:5, SABTU:6
};

export default function JadwalHariIni({ jadwal }: { jadwal: any[] }) {
  const todayIdx = new Date().getDay();
  const hariIni  = Object.entries(HARI_MAP).find(([,v]) => v === todayIdx)?.[0];
  const filtered = jadwal.filter((j) => j.hari === hariIni);

  if (filtered.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Jadwal Hari Ini</h2>
        <div className="text-center py-8 text-gray-400 text-sm">Tidak ada jadwal mengajar hari ini</div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800">Jadwal Hari Ini</h2>
        <span className="text-xs text-gray-400">{hariIni}</span>
      </div>
      <div className="space-y-3">
        {filtered.map((j) => (
          <div key={j.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{j.mataPelajaran?.namaMapel ?? j.mapel}</p>
              <p className="text-xs text-gray-500">Kelas {j.kelas.nama} • {j.jamMulai}–{j.jamSelesai}</p>
            </div>
            <Link href={`/guru/absensi/${j.id}`}
              className="flex items-center gap-1 text-xs bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg hover:bg-[#2E7D32] transition-colors flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> Absensi
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}