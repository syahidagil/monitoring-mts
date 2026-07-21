import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

export default function SiswaTahfidzList({ siswa }: { siswa: any[] }) {
  if (siswa.length === 0)
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Belum ada siswa program tahfidz di kelas Anda
      </div>
    );
  return (
    <div className="space-y-3">
      {siswa.map((s) => (
        <Link key={s.id} href={`/guru/hafalan/${s.id}`}
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-200 transition-all group">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{s.nama}</p>
            <p className="text-xs text-gray-500">{s.nis} • Kelas {s.kelas.nama} • {s._count.hafalan} catatan</p>
            {s.hafalan?.[0] && (
              <p className="text-xs text-green-600 mt-0.5">
                Terakhir: {s.hafalan[0].surah} ({s.hafalan[0].status})
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}