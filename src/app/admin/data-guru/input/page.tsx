import GuruForm from "@/components/admin/guru/GuruForm";
export default function InputGuruPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Guru Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Isi form berikut untuk menambahkan data guru baru</p>
      </div>
      <GuruForm />
    </div>
  );
}