import { getTahunAjaranAktif } from "@/actions/kelas.action";
import MapelForm from "@/components/admin/mapel/MapelForm";

export default async function InputMapelPage() {
  const tahunAktif = await getTahunAjaranAktif();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Input Data Mata Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah mata pelajaran baru ke sistem</p>
      </div>
      <MapelForm tahunAktif={tahunAktif} />
    </div>
  );
}