import { getAllKelas } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import { getAllMapel } from "@/actions/mapel.action";
import JadwalForm from "@/components/admin/jadwal/JadwalForm";

export default async function InputJadwalPage() {
  const [kelas, guru, mapel] = await Promise.all([
    getAllKelas(),
    getAllGuru(),
    getAllMapel(),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Jadwal Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Input jadwal mata pelajaran per kelas</p>
      </div>
      <JadwalForm kelas={kelas} guru={guru} mapel={mapel} />
    </div>
  );
}