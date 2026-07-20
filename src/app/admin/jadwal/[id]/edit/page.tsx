import { getJadwalById, getDataForJadwalForm } from "@/actions/jadwal.action";
import { notFound } from "next/navigation";
import JadwalForm from "@/components/admin/jadwal/JadwalForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [jadwal, { kelas, guru, mapel, tahunAjaran }] = await Promise.all([
    getJadwalById(Number(id)),
    getDataForJadwalForm(),
  ]);
  if (!jadwal) notFound();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Jadwal</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jadwal.hari} — {jadwal.mataPelajaran?.namaMapel} (Kelas {jadwal.kelas.nama})
          </p>
        </div>
        <Link href="/admin/jadwal"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
      {jadwal._count.absensi > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5">
          <p className="text-sm text-yellow-700">
            ⚠ Jadwal ini sudah memiliki <strong>{jadwal._count.absensi} data absensi</strong>.
            Hari, jam, dan kelas tidak dapat diubah.
          </p>
        </div>
      )}
      <JadwalForm
        kelas={kelas} guru={guru} mapel={mapel} tahunAjaran={tahunAjaran}
        defaultValues={jadwal} isEdit jadwalId={jadwal.id}
      />
    </div>
  );
}