import { getAllKelas } from "@/actions/kelas.action";
import { getAllOrangTua } from "@/actions/orangtua.action";
import { getAllTahunAjaran } from "@/actions/kelas.action";
import SiswaForm from "@/components/admin/siswa/SiswaForm";

export default async function InputSiswaPage() {
  const [kelas, orangtua, tahunAjaran] = await Promise.all([
    getAllKelas(),
    getAllOrangTua(),
    getAllTahunAjaran(),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Input Data Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah data siswa baru ke sistem monitoring</p>
      </div>
      <SiswaForm kelas={kelas} orangtua={orangtua} tahunAjaran={tahunAjaran} />
    </div>
  );
}