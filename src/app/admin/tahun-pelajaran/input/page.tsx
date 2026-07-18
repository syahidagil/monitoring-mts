import TahunPelajaranForm from "@/components/admin/tahun-pelajaran/TahunPelajaranForm";
export default function InputTahunPelajaranPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Tahun Ajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah periode tahun pelajaran baru</p>
      </div>
      <TahunPelajaranForm />
    </div>
  );
}