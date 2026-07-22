import { getRekapNilaiGuru, getKelasGuru, getMapelGuru } from "@/actions/guru/rekap.action";
import RekapNilaiTable from "@/components/guru/rekap/RekapNilaiTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { searchParams: Promise<{ kelasId?: string; mapel?: string; semester?: string; tahunAjar?: string }> };

export default async function RekapNilaiPage({ searchParams }: Props) {
  const params = await searchParams;
  const [data, kelasList, mapelList] = await Promise.all([
    getRekapNilaiGuru({
      kelasId: params.kelasId ? Number(params.kelasId) : undefined,
      mapel: params.mapel, semester: params.semester, tahunAjar: params.tahunAjar,
    }),
    getKelasGuru(),
    getMapelGuru(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <Link href="/guru/rekap" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Rekap Nilai</h1>
        </div>
        <form className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <select name="kelasId" defaultValue={params.kelasId ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
          </select>
          <select name="mapel" defaultValue={params.mapel ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Mapel</option>
            {mapelList.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="semester" defaultValue={params.semester ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Semester</option>
            <option value="GANJIL">Ganjil</option>
            <option value="GENAP">Genap</option>
          </select>
          <button type="submit" className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
            Tampilkan
          </button>
        </form>
        <RekapNilaiTable data={data} />
      </div>
    </main>
  );
}