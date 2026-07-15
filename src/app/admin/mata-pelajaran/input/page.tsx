import MapelForm from "@/components/admin/mapel/MapelForm";
export default function InputMapelPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Mata Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah mata pelajaran baru ke sistem</p>
      </div>
      <MapelForm />
    </div>
  );
}