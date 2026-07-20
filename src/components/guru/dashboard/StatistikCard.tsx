import { Users, BookOpen, ClipboardCheck, Star } from "lucide-react";

type Props = {
  totalSiswa: number;
  totalJadwal: number;
  totalAbsensiHariIni: number;
  totalNilaiInput: number;
};

const STATS = [
  { key: "totalSiswa",         label: "Total Siswa",       icon: Users,           color: "bg-blue-50 text-blue-600"   },
  { key: "totalJadwal",        label: "Jadwal Mengajar",   icon: BookOpen,        color: "bg-green-50 text-green-600" },
  { key: "totalAbsensiHariIni",label: "Absensi Hari Ini",  icon: ClipboardCheck,  color: "bg-yellow-50 text-yellow-600" },
  { key: "totalNilaiInput",    label: "Input Nilai",       icon: Star,            color: "bg-purple-50 text-purple-600" },
] as const;

export default function StatistikCard(props: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{props[key]}</p>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}