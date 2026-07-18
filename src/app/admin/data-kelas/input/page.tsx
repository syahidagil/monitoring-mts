import { getAllTahunAjaran, getTahunAjaranAktif } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import KelasForm from "@/components/admin/kelas/KelasForm";

export default async function InputKelasPage() {
  const [tahunAjaran, guru, tahunAktif] = await Promise.all([
    getAllTahunAjaran(),
    getAllGuru(),
    getTahunAjaranAktif(),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Input Data Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">Manajemen Data Kelas</p>
      </div>
      <KelasForm tahunAjaran={tahunAjaran} guru={guru} defaultTahunAjaranId={tahunAktif?.id} />
    </div>
  );
}