import BeritaForm from "../BeritaForm";
export default function TambahBeritaPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tambah Berita</h1>
        <p className="text-sm text-gray-500 mt-1">Buat berita baru untuk ditampilkan di halaman publik</p>
      </div>
      <BeritaForm />
    </div>
  );
}
