import { redirect } from "next/navigation";
import { getDashboardOrangTua } from "@/actions/orangtua/dashboard.action";
import Link from "next/link";
import LineChartMini from "@/components/orangtua/LineChartMini";
import { BookOpen, BookMarked, Heart, Calendar, Activity, ArrowUpRight, Star } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  HADIR: "bg-green-100 text-green-700", SAKIT: "bg-blue-100 text-blue-700",
  IZIN: "bg-yellow-100 text-yellow-700", ALPHA: "bg-red-100 text-red-700",
};

export default async function OrangtuaDashboard() {
  const data = await getDashboardOrangTua();
  if (!data) redirect("/login");

  const { ortu, absensiMap, monitoringTerbaru, nilaiPerkembangan } = data;
  const namaOrtu = ortu.user?.name || "Wali Murid";
  const namaAnak = ortu.anak.map((a) => a.nama).join(", ");
  const totalAbsensi = ortu.anak.reduce((a, c) => a + c._count.absensi, 0);
  const totalNilai = ortu.anak.reduce((a, c) => a + c._count.nilai, 0);
  const totalSikap = ortu.anak.reduce((a, c) => a + c._count.sikap, 0);
  const totalTahsin = ortu.anak.reduce((a, c) => a + c._count.tahsin, 0);
  const totalHafalan = ortu.anak.reduce((a, c) => a + c._count.hafalan, 0);
  const totalMonitoring = totalAbsensi + totalNilai + totalSikap + totalTahsin + totalHafalan;

  const kartu = [
    { label: "Total Monitoring", value: totalMonitoring, icon: Activity, color: "bg-emerald-50 text-emerald-700" },
    { label: "Data Absensi", value: totalAbsensi, icon: Calendar, color: "bg-lime-50 text-lime-700" },
    { label: "Total Nilai", value: totalNilai, icon: BookOpen, color: "bg-blue-50 text-blue-700" },
    { label: "Catatan Sikap", value: totalSikap, icon: Heart, color: "bg-rose-50 text-rose-700" },
    { label: "Data Tahsin", value: totalTahsin, icon: Star, color: "bg-amber-50 text-amber-700" },
    { label: "Catatan Hafalan", value: totalHafalan, icon: BookMarked, color: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Portal Orang Tua</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Selamat Datang, {namaOrtu}</h1>
          <p className="text-sm text-gray-600 mt-2">
            {namaAnak ? `Monitoring terbaru untuk: ${namaAnak}` : "Pantau perkembangan anak Anda di sini."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {ortu.anak.length === 0 ? (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">Belum ada data anak</span>
            ) : (
              ortu.anak.map((a) => (
                <span key={a.id} className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 font-medium">
                  {a.nama} • {a.kelas.nama}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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

        <div className="xl:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">Monitoring Terbaru</h3>
            </div>
            {monitoringTerbaru.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada aktivitas monitoring</p>
            ) : (
              <div className="space-y-2">
                {monitoringTerbaru.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {item.jenis}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">{item.judul}</p>
                      <p className="text-xs text-gray-400 truncate">{item.deskripsi}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 mt-1 shrink-0 transition group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-800">Grafik Perkembangan Nilai Anak</h3>
            </div>
            <LineChartMini data={nilaiPerkembangan} />
          </div>
        </div>
      </div>
    </div>
  );
}