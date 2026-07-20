import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

const HARI_COLOR: Record<string, string> = {
  SENIN:"bg-blue-50 text-blue-700", SELASA:"bg-purple-50 text-purple-700",
  RABU:"bg-green-50 text-green-700", KAMIS:"bg-yellow-50 text-yellow-700",
  JUMAT:"bg-orange-50 text-orange-700", SABTU:"bg-pink-50 text-pink-700",
};

export default function JadwalList({ jadwal }: { jadwal: any[] }) {
  if (jadwal.length === 0)
    return <div className="text-center py-16 text-gray-400 text-sm">Belum ada jadwal mengajar</div>;

  return (
    <div className="space-y-3">
      {jadwal.map((j) => (
        <Link key={j.id} href={`/guru/absensi/${j.id}`}
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-200 transition-all group">
          <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 ${HARI_COLOR[j.hari] ?? "bg-gray-100 text-gray-600"}`}>
            {j.hari}
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{j.mataPelajaran?.namaMapel ?? j.mapel}</p>
            <p className="text-xs text-gray-500">Kelas {j.kelas.nama} • {j.jamMulai}–{j.jamSelesai}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}