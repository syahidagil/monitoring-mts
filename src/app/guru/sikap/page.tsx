import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { getDataHalamanSikap } from "@/actions/guru/sikap.action";
import SikapRiwayat from "@/components/guru/sikap/SikapRiwayat";

export default async function GuruSikapPage() {
  const data = await getDataHalamanSikap();
  if (!data) redirect("/login");

  const { guru, tahunAjaran, kelasList, statistik, rows } = data;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Judul + tombol tambah */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Sikap &amp; Pelanggaran Siswa
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Pantau dan catat perkembangan karakter serta kedisiplinan siswa
              untuk mendukung ekosistem belajar yang positif.
            </p>
          </div>
          <Link
            href="/guru/sikap/tambah"
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Tambah Catatan Sikap
          </Link>
        </div>

        {/* Kartu info guru + statistik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4">
              Informasi Guru Pengampu
            </h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <Info label="Nama Lengkap" value={guru.nama} />
              <Info label="NIP" value={guru.nip} />
              <Info label="Mata Pelajaran" value={guru.mapel} />
              <Info
                label="Semester / Tahun"
                value={
                  tahunAjaran
                    ? `${tahunAjaran.semester === "GANJIL" ? "Ganjil" : "Genap"} / ${tahunAjaran.nama}`
                    : "-"
                }
              />
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-emerald-800">Statistik Bulan Ini</p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-bold">{statistik.positif}</span> Catatan Positif
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-bold text-rose-600">{statistik.pelanggaran}</span>{" "}
              Pelanggaran Tercatat
            </p>
          </div>
        </div>

        {/* Filter + riwayat (client) */}
        <SikapRiwayat rows={rows} kelasList={kelasList} />
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}