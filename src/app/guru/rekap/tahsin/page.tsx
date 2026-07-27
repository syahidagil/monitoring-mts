import { getRekapTahsinGuru, getKelasGuru, getSiswaTahsinGuru } from "@/actions/guru/rekap.action";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RekapTahsinTable from "@/components/guru/rekap/RekapTahsinTable";
import DownloadRekapTahsinPDF from "@/components/guru/rekap/DownloadRekapTahsinPDF";
import AutoSubmitForm from "@/components/shared/AutoSubmitForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { searchParams: Promise<{ kelasId?: string; siswaId?: string }> };

export default async function RekapTahsinPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const params = await searchParams;
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const siswaId = params.siswaId ? Number(params.siswaId) : undefined;

  const [data, kelasList, siswaList, guru] = await Promise.all([
    getRekapTahsinGuru({ kelasId, siswaId }),
    getKelasGuru(),
    getSiswaTahsinGuru(kelasId),
    prisma.guru.findUnique({
      where: { id: session.user.id },
      include: { user: { select: { name: true } } },
    }),
  ]);

  const kelasFilter = kelasList.find((k) => k.id === kelasId)?.nama;
  const siswaTerpilih = siswaList.find((s) => s.id === siswaId);

  const stats = siswaTerpilih ? {
    total: data.length,
    tajwidL: data.filter((d) => d.tajwid === "L").length,
    makhrajL: data.filter((d) => d.makhraj === "L").length,
    sifatulL: data.filter((d) => d.sifatul === "L").length,
  } : null;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/guru/rekap" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Rekap Tahsin Siswa</h1>
            <p className="text-sm text-gray-500 mt-0.5">Laporan evaluasi bacaan Al-Qur'an (Tajwid, Makhraj, Sifatul Huruf)</p>
          </div>
          <DownloadRekapTahsinPDF
            data={data}
            guruNama={guru?.user?.name ?? ""}
            kelasFilter={kelasFilter ? `Kelas ${kelasFilter}` : undefined}
            siswaFilter={siswaTerpilih ? {
              nama: siswaTerpilih.nama,
              nis: siswaTerpilih.nis,
              kelas: `Kelas ${siswaTerpilih.kelas.nama}`,
            } : undefined}
          />
        </div>

        {/* Form Filter Per Kelas & Per Siswa */}
        <AutoSubmitForm className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <select
            name="kelasId"
            defaultValue={params.kelasId ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>Kelas {k.nama}</option>
            ))}
          </select>

          <select
            name="siswaId"
            defaultValue={params.siswaId ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-48"
          >
            <option value="">Semua Siswa</option>
            {siswaList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} ({s.nis} - Kelas {s.kelas.nama})
              </option>
            ))}
          </select>

          <button type="submit" className="bg-[#1B5E20] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
            Tampilkan
          </button>
        </AutoSubmitForm>

        {/* Kartu Profil Ringkasan Siswa jika disaring Per Siswa */}
        {siswaTerpilih && stats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] font-bold text-lg">
                {siswaTerpilih.nama.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{siswaTerpilih.nama}</h2>
                <p className="text-xs text-gray-500">NIS: {siswaTerpilih.nis} • Kelas {siswaTerpilih.kelas.nama}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <p className="text-xs text-gray-400">Total Evaluasi</p>
                <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                <p className="text-xs text-green-600">Tajwid Lancar</p>
                <p className="text-lg font-bold text-green-700">{stats.tajwidL}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                <p className="text-xs text-green-600">Makhraj Lancar</p>
                <p className="text-lg font-bold text-green-700">{stats.makhrajL}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                <p className="text-xs text-green-600">Sifatul Lancar</p>
                <p className="text-lg font-bold text-green-700">{stats.sifatulL}</p>
              </div>
            </div>
          </div>
        )}

        <RekapTahsinTable data={data} />
      </div>
    </div>
  );
}