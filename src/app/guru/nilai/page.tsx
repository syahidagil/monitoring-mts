import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJadwalByGuru } from "@/actions/jadwal.action";
import MapelPicker from "@/components/guru/nilai/MapelPicker";

export default async function GuruNilaiPage() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const jadwal = await getJadwalByGuru(session.user.id);

  // Dedup per (kelas + mapel) — satu kartu per mapel yang diajar di tiap kelas
  const unik = jadwal.filter(
    (j, i, arr) =>
      i ===
      arr.findIndex((x) => x.kelasId === j.kelasId && x.kodeMapel === j.kodeMapel)
  );

  const daftar = unik.map((j) => ({
    jadwalId: j.id,
    kodeMapel: j.kodeMapel,
    namaMapel: j.mataPelajaran?.namaMapel ?? j.kodeMapel,
    kelasNama: j.kelas.nama,
    tingkat: j.kelas.tingkat,
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Nilai</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pilih mata pelajaran dan kelas untuk menginput atau mengubah nilai
            siswa
          </p>
        </div>

        <MapelPicker daftar={daftar} />
      </div>
    </main>
  );
}