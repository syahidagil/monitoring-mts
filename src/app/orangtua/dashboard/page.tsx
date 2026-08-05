import { redirect } from "next/navigation";
import { getDashboardOrangTua } from "@/actions/orangtua/dashboard.action";
import { Users, BookOpen, BookMarked, Heart, Calendar, TrendingUp } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  HADIR: "bg-green-100 text-green-700", SAKIT: "bg-blue-100 text-blue-700",
  IZIN: "bg-yellow-100 text-yellow-700", ALPHA: "bg-red-100 text-red-700",
};

export default async function OrangtuaDashboard() {
  const data = await getDashboardOrangTua();
  if (!data) redirect("/login");

  const { ortu, absensiMap, nilaiTerbaru } = data;
  const namaAnak = ortu.anak.map((a) => a.nama).join(", ");
  const totalNilai = ortu.anak.reduce((a, c) => a + c._count.nilai, 0);
  const totalHafalan = ortu.anak.reduce((a, c) => a + c._count.hafalan, 0);
  const totalSikap = ortu.anak.reduce((a, c) => a + c._count.sikap, 0);

  const kartu = [
    { label: "Anak Terdaftar", value: ortu.anak.length, icon: Users, color: "bg-green-50 text-green-700" },
    { label: "Total Nilai", value: totalNilai, icon: BookOpen, color: "bg-blue-50 text-blue-700" },
    { label: "Catatan Hafalan", value: totalHafalan, icon: BookMarked, color: "bg-violet-50 text-violet-700" },
    { label: "Catatan Sikap", value: totalSikap, icon: Heart, color: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Wali Murid</h1>
        <p className="text-sm text-gray-500 mt-1">
          {namaAnak ? `Wali murid dari: ${namaAnak}` : "Portal Monitoring Anak"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kartu.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-gray-800">Absensi Bulan Ini</h3>
          </div>
          {ortu.anak.map((a) => {
            const ab = absensiMap[a.id] ?? { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
            return (
              <div key={a.id} className="mb-4 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  {a.nama} — Kelas {a.kelas.nama}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(ab).map(([s, n]) => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[s]}`}>
                      {s}: {n}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
                    <p className="text-xs text-gray-400">{n.siswaNama} &middot; {n.jenis}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${n.nilai >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {n.nilai}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}