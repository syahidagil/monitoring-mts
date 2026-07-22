import { getRekapAbsensiGuru, getKelasGuru } from "@/actions/guru/rekap.action";
import RekapAbsensiTable from "@/components/guru/rekap/RekapAbsensiTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { searchParams: Promise<{ kelasId?: string; mulai?: string; akhir?: string }> };

export default async function RekapAbsensiPage({ searchParams }: Props) {
  const params = await searchParams;
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const [data, kelasList] = await Promise.all([
    getRekapAbsensiGuru({ kelasId, tanggalMulai: params.mulai, tanggalAkhir: params.akhir }),
    getKelasGuru(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <Link href="/guru/rekap" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Rekap Absensi</h1>
        </div>
        <form className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <select name="kelasId" defaultValue={params.kelasId ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
          </select>
          <input type="date" name="mulai" defaultValue={params.mulai ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="date" name="akhir" defaultValue={params.akhir ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button type="submit" className="bg-[#1B5E20] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
            Tampilkan
          </button>
        </form>
        <RekapAbsensiTable data={data} />
      </div>
    </main>
  );
}