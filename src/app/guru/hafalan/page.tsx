import { redirect } from "next/navigation";
import { getDataHalamanTahfidz } from "@/actions/guru/hafalan.action";
import TahfidzSantriList from "@/components/guru/hafalan/TahfidzSantriList";
import { Pencil } from "lucide-react";

export default async function GuruHafalanPage() {
  const data = await getDataHalamanTahfidz();
  if (!data) redirect("/login");

  const { guru, tahunAjaran, kelasList, santri } = data;
  const inisialGuru = guru.nama
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Judul */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Input Hafalan Al-Qur&rsquo;an (Tahfidz)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pencatatan perkembangan hafalan harian santri secara real-time
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
                  NIP: {guru.nip} &middot; Program: Tahfidz
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

        {/* Filter + tabel (client) */}
        <TahfidzSantriList santri={santri} kelasList={kelasList} />
      </div>
    </main>
  );
}