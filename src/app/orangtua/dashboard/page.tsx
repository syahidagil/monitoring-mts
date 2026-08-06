import { redirect } from "next/navigation";
import { getDashboardOrangTua } from "@/actions/orangtua/dashboard.action";
import Link from "next/link";
import LineChartMini from "@/components/orangtua/LineChartMini";
// import { BookOpen, BookMarked, Heart, Calendar, Activity, ArrowUpRight, Star } from "lucide-react";

export default async function OrangtuaDashboard() {
  const data = await getDashboardOrangTua();
  if (!data) redirect("/login");

  const { ortu, anakAktifNama, ringkasanJumlah, monitoringTerbaru, nilaiPerkembangan } = data;
  const namaOrtu = ortu.user?.name || "Wali Murid";
  const namaAnak = ortu.anak.map((a) => a.nama).join(", ");
  const jumlahAnak = ortu.anak.length;

  const kartu = [
    {
      label: "Total Monitoring",
      total: ringkasanJumlah.monitoring,
      // icon: Activity,
      // color: "bg-emerald-50 text-emerald-700",
      keterangan: `Gabungan absensi, nilai, sikap, tahsin, dan tahfizh untuk ${jumlahAnak} anak`,
    },
    {
      label: "Total Absensi",
      total: ringkasanJumlah.absensi,
      // icon: Calendar,
      // color: "bg-lime-50 text-lime-700",
      keterangan: `Total data absensi yang diinput guru untuk ${jumlahAnak} anak`,
    },
    {
      label: "Total Nilai",
      total: ringkasanJumlah.nilai,
      // icon: BookOpen,
      // color: "bg-blue-50 text-blue-700",
      keterangan: `Total data nilai yang diinput guru untuk ${jumlahAnak} anak`,
    },
    {
      label: "Total Sikap",
      total: ringkasanJumlah.sikap,
      // icon: Heart,
      color: "bg-rose-50 text-rose-700",
      keterangan: `Total data sikap yang diinput guru untuk ${jumlahAnak} anak`,
    },
    {
      label: "Total Tahsin",
      total: ringkasanJumlah.tahsin,
      // icon: Star,
      color: "bg-amber-50 text-amber-700",
      keterangan: `Total data tahsin yang diinput guru untuk ${jumlahAnak} anak`,
    },
    {
      label: "Total Tahfizh",
      total: ringkasanJumlah.hafalan,
      // icon: BookMarked,
      color: "bg-violet-50 text-violet-700",
      keterangan: `Total data tahfizh yang diinput guru untuk ${jumlahAnak} anak`,
    },
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
          {kartu.map(({ label, total, color, keterangan }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
                {/* <Icon className="w-4 h-4" /> */}
              </div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{total}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-8">
                {keterangan}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            {/* <BookOpen className="w-4 h-4 text-emerald-600" /> */}
            <h3 className="text-sm font-bold text-gray-800">
              {anakAktifNama ? `Grafik Perkembangan Nilai ${anakAktifNama}` : "Grafik Perkembangan Nilai Anak"}
            </h3>
          </div>
          <LineChartMini data={nilaiPerkembangan} />
        </div>

        <div className="xl:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              {/* <Activity className="w-4 h-4 text-blue-600" /> */}
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
                    {/* <ArrowUpRight className="w-4 h-4 text-gray-300 mt-1 shrink-0 transition group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> */}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}