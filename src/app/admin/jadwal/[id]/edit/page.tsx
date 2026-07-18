import { getJadwalById } from "@/actions/jadwal.action";
import { getAllKelas } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import { getAllMapel } from "@/actions/mapel.action";
import { notFound } from "next/navigation";
import JadwalForm from "@/components/admin/jadwal/JadwalForm";

export default async function EditJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [jadwal, kelas, guru, mapel] = await Promise.all([
    getJadwalById(Number(id)),
    getAllKelas(),
    getAllGuru(),
    getAllMapel(),
  ]);
  if (!jadwal) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Jadwal Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">{jadwal.hari} - {jadwal.mapel} (Kelas {jadwal.kelas.nama})</p>
      </div>
      <JadwalForm kelas={kelas} guru={guru} mapel={mapel} defaultValues={jadwal} isEdit jadwalId={jadwal.id} />
    </div>
  );
}