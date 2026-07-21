import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function DaftarMengajar({ jadwal }: { jadwal: any[] }) {
  const unique = jadwal.filter((j, i, arr) =>
    i === arr.findIndex((x) => x.kelasId === j.kelasId && x.mapel === j.mapel)
  );
  return (
    <div className="space-y-3">
      {unique.map((j) => (
        <Link key={j.id} href={`/guru/nilai/${j.id}`}
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-200 transition-all group">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-purple-700">{j.kelas.tingkat}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{j.mataPelajaran?.namaMapel ?? j.mapel}</p>
            <p className="text-xs text-gray-500">Kelas {j.kelas.nama}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors" />
        </Link>
      ))}
    </div>
  );
}