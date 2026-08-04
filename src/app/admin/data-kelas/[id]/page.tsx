import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, GraduationCap, Users, BookOpen,
  CalendarDays, User, LayoutGrid
} from "lucide-react";

async function getKelasDetail(id: number) {
  return prisma.kelas.findUnique({
    where: { id },
    include: {
      tahunAjaran: true,
      waliKelas: { include: { user: { select: { name: true } } } },
      siswa: {
        select: { id: true, nis: true, nama: true, jenisKelamin: true, statusTahfidz: true },
        orderBy: { nama: "asc" },
      },
      jadwal: {
        include: {
          mataPelajaran: { select: { namaMapel: true } },
          guru: { include: { user: { select: { name: true } } } },
        },
        orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      },
      _count: { select: { siswa: true, jadwal: true } },
    },
  });
}

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

export default async function DetailKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kelas = await getKelasDetail(Number(id));
  if (!kelas) notFound();

  const jadwalByHari = HARI_ORDER.reduce<Record<string, typeof kelas.jadwal>>((acc, hari) => {
    acc[hari] = kelas.jadwal.filter((j) => j.hari === hari);
    return acc;
  }, {});

  const hariAdaJadwal = HARI_ORDER.filter((h) => jadwalByHari[h].length > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/data-kelas"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Kelas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap kelas {kelas.nama}</p>
          </div>
        </div>
        <Link href="/admin/data-kelas"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Edit className="w-4 h-4" /> Edit Data
        </Link>
      </div>

      {/* Info Kelas Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>
          <div className="text-white flex-1">
            <h2 className="text-2xl font-bold">{kelas.nama}</h2>
            <p className="text-green-200 text-sm mt-0.5">{kelas.tahunAjaran.nama}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Tingkat {kelas.tingkat}
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {kelas._count.siswa} Siswa
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {kelas._count.jadwal} Jadwal
              </span>
            </div>
          </div>
        </div>

        {/* Info Umum */}
        <div className="p-6 grid sm:grid-cols-3 gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#1B5E20]/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#1B5E20]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tingkat</p>
              <p className="text-sm font-bold text-gray-800">Kelas {kelas.tingkat}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Wali Kelas</p>
              <p className="text-sm font-bold text-gray-800 truncate">
                {kelas.waliKelas?.user.name ?? "Belum ditentukan"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tahun Pelajaran</p>
              <p className="text-sm font-bold text-gray-800">{kelas.tahunAjaran.nama}</p>
            </div>
          </div>
        </div>

        {/* Daftar Siswa */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
            <Users className="w-4 h-4 text-[#1B5E20]" />
            Daftar Siswa ({kelas._count.siswa})
          </h3>
          {kelas.siswa.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada siswa di kelas ini</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {kelas.siswa.map((s, i) => (
                <Link key={s.id} href={`/admin/data-siswa/${s.id}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors group">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-green-700">{s.nama}</p>
                    <p className="text-xs text-gray-400">{s.nis} • {s.jenisKelamin === "L" ? "L" : "P"}</p>
                  </div>
                  {s.statusTahfidz && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">T</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Jadwal Pelajaran */}
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
            <BookOpen className="w-4 h-4 text-[#1B5E20]" />
            Jadwal Pelajaran ({kelas._count.jadwal})
          </h3>
          {hariAdaJadwal.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada jadwal untuk kelas ini</p>
          ) : (
            <div className="space-y-4">
              {hariAdaJadwal.map((hari) => (
                <div key={hari}>
                  <p className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-2">{hari}</p>
                  <div className="space-y-1.5">
                    {jadwalByHari[hari].map((j: any) => (
                      <div key={j.id}
                        className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs font-mono text-gray-500 w-24 flex-shrink-0">
                          {j.jamMulai} – {j.jamSelesai}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-gray-800">
                            {j.mataPelajaran?.namaMapel ?? "-"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 truncate max-w-32">
                          {j.guru?.user?.name ?? "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
