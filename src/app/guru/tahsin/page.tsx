import { redirect } from "next/navigation";
import { getDataHalamanTahsin } from "@/actions/guru/tahsin.action";
import TahsinSiswaList from "@/components/guru/tahsin/TahsinSiswaList";

export default async function GuruTahsinPage() {
  const data = await getDataHalamanTahsin();
  if (!data) redirect("/login");

  const { guru, tahunAjaran, kelasList, siswa } = data;
  const inisialGuru = guru.nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Input Tahsin Al-Qur&rsquo;an
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pencatatan perkembangan bacaan (tajwid, makhraj, sifatul huruf) siswa
          </p>
        </div>

        {/* Kartu profil guru */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 ring-2 ring-emerald-200 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-emerald-700">
                  {inisialGuru}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{guru.nama}</p>
                <p className="text-sm text-gray-500">
                  NIP: {guru.nip} &middot; Program: Tahsin
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Semester Aktif
              </p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {tahunAjaran
                  ? `${tahunAjaran.semester === "GANJIL" ? "Ganjil" : "Genap"} ${tahunAjaran.nama}`
                  : "Belum diatur"}
              </p>
            </div>
          </div>
        </div>

        {/* Filter + tabel */}
        <TahsinSiswaList
          siswa={siswa}
          kelasList={kelasList}
          guruNama={guru.nama}
          tahunAjaran={tahunAjaran
            ? `${tahunAjaran.semester === "GANJIL" ? "Ganjil" : "Genap"} ${tahunAjaran.nama}`
            : undefined}
        />
      </div>
    </main>
  );
}