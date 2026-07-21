import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHafalanBySiswa } from "@/actions/guru/hafalan.action";
import HafalanForm from "@/components/guru/hafalan/HafalanForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  BELUM:"bg-gray-100 text-gray-600", PROSES:"bg-blue-100 text-blue-700",
  LULUS:"bg-green-100 text-green-700", MENGULANG:"bg-red-100 text-red-700",
};

export default async function HafalanSiswaPage({ params }: { params: Promise<{ siswaId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { siswaId } = await params;
  const siswa = await prisma.siswa.findUnique({
    where: { id: Number(siswaId) },
    include: { kelas: { select: { nama: true } } },
  });
  if (!siswa) notFound();

  const hafalan = await getHafalanBySiswa(Number(siswaId));
  const stats = {
    lulus:     hafalan.filter((h) => h.status === "LULUS").length,
    proses:    hafalan.filter((h) => h.status === "PROSES").length,
    mengulang: hafalan.filter((h) => h.status === "MENGULANG").length,
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <Link href="/guru/hafalan" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{siswa.nama}</h1>
          <p className="text-sm text-gray-500">{siswa.nis} • Kelas {siswa.kelas.nama}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Lulus",     value: stats.lulus,     color: "bg-green-50 text-green-700 border-green-100" },
            { label: "Proses",    value: stats.proses,    color: "bg-blue-50 text-blue-700 border-blue-100"   },
            { label: "Mengulang", value: stats.mengulang, color: "bg-red-50 text-red-700 border-red-100"      },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <HafalanForm siswaId={siswa.id} siswaName={siswa.nama} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Riwayat Hafalan ({hafalan.length})</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {hafalan.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm">Belum ada riwayat hafalan</p>
              )}
              {hafalan.map((h) => (
                <div key={h.id} className="px-5 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {h.surah} ({h.ayatMulai}-{h.ayatSelesai})
                    </p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[h.status]}`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {h.juz && <span className="text-xs text-gray-400">Juz {h.juz}</span>}
                    {h.nilai && (
                      <span className="text-xs font-semibold text-green-600">
                        Nilai: {String(h.nilai)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(h.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  {h.catatan && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{h.catatan}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}