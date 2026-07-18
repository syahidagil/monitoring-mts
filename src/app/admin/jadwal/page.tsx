import { getAllJadwal } from "@/actions/jadwal.action";
import { getAllKelas } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import Link from "next/link";
import { Plus } from "lucide-react";
import JadwalTable from "@/components/admin/jadwal/JadwalTable";

type Props = { searchParams: Promise<{ kelasId?: string; guruId?: string; hari?: string }> };

export default async function JadwalPage({ searchParams }: Props) {
  const params = await searchParams;
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const guruId = params.guruId ?? undefined;
  const hari = params.hari ?? undefined;

  const [jadwal, kelasList, guruList] = await Promise.all([
    getAllJadwal({ kelasId, guruId, hari }),
    getAllKelas(),
    getAllGuru(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jadwal Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">Total {jadwal.length} jadwal</p>
        </div>
        <Link href="/admin/jadwal/input"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form className="flex flex-wrap gap-3 w-full">
          <select name="kelasId" defaultValue={params.kelasId ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
          </select>
          <select name="guruId" defaultValue={params.guruId ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Guru</option>
            {guruList.map((g) => <option key={g.id} value={g.id}>{g.user.name}</option>)}
          </select>
          <select name="hari" defaultValue={params.hari ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">Semua Hari</option>
            {["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"].map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </form>
      </div>

      <JadwalTable data={jadwal} />
    </div>
  );
}