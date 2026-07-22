import { Users, BookOpen, BookMarked, Heart } from "lucide-react";

type Props = {
  jumlahAnak: number;
  totalNilai: number;
  totalHafalan: number;
  totalSikap: number;
};

export default function RingkasanCard(props: Props) {
  const CARDS = [
    { label: "Anak Terdaftar",  value: props.jumlahAnak,   icon: Users,     color: "bg-green-50 text-green-700"  },
    { label: "Total Nilai",     value: props.totalNilai,   icon: BookOpen,  color: "bg-blue-50 text-blue-700"    },
    { label: "Catatan Hafalan", value: props.totalHafalan, icon: BookMarked, color: "bg-purple-50 text-purple-700" },
    { label: "Catatan Sikap",   value: props.totalSikap,   icon: Heart,     color: "bg-pink-50 text-pink-700"    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {CARDS.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}