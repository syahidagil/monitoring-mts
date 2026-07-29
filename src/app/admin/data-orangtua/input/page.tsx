import OrangtuaForm from "@/components/admin/orangtua/OrangtuaForm";

export default function InputOrangtuaPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Data Wali Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">Input data wali siswa baru</p>
      </div>
      <OrangtuaForm />
    </div>
  );
}