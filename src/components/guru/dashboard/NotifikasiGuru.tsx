import { Bell, BookOpen, ClipboardCheck } from "lucide-react";
import Link from "next/link";

type Props = {
  jadwalBelumAbsensi: any[];
  kelasAktif: any[];
};

export default function NotifikasiGuru({ jadwalBelumAbsensi, kelasAktif }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-gray-800">Notifikasi</h3>
        </div>
        {jadwalBelumAbsensi.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Semua absensi sudah terisi</p>
        ) : (
          <div className="space-y-2">
            {jadwalBelumAbsensi.slice(0, 5).map((j) => (
              <Link key={j.id} href={`/guru/absensi/${j.id}`}
                className="flex items-start gap-2.5 p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg hover:bg-yellow-100 transition-colors">
                <ClipboardCheck className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800">Absensi belum diisi</p>
                  <p className="text-xs text-yellow-600">{j.hari} • Kelas {j.kelas.nama} • {j.mapel}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-gray-800">Kelas Diampu</h3>
        </div>
        <div className="space-y-2">
          {kelasAktif.map((k) => (
            <div key={k.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-medium text-gray-700">Kelas {k.nama}</span>
              <span className="text-xs text-gray-400">{k._count?.siswa ?? 0} siswa</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}