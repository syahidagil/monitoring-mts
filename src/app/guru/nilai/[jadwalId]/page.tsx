import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getNilaiInput, getRiwayatNilai } from "@/actions/guru/nilai.action";
import { JENIS_NILAI, type JenisNilaiInput } from "@/lib/validations/guru/nilai.validation";
import NilaiInputGrid from "@/components/guru/nilai/NilaiInputGrid";
import RiwayatNilai from "@/components/guru/nilai/RiwayatNilai";

export default async function InputNilaiPage({
  params,
  searchParams,
}: {
  params: Promise<{ jadwalId: string }>;
  searchParams: Promise<{ jenis?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");

  const { jadwalId } = await params;
  const sp = await searchParams;
  const jenis: JenisNilaiInput = (JENIS_NILAI as readonly string[]).includes(sp.jenis ?? "")
    ? (sp.jenis as JenisNilaiInput)
    : "TUGAS";

  const data = await getNilaiInput(Number(jadwalId), jenis);
  if (!data) notFound();

  const riwayat = await getRiwayatNilai(Number(jadwalId));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link
            href="/guru/nilai"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke daftar mapel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Input Nilai</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.jadwal.namaMapel} &middot; Kelas {data.jadwal.kelasNama} &middot;{" "}
            {data.jadwal.semester === "GANJIL" ? "Ganjil" : "Genap"}{" "}
            {data.jadwal.tahunAjar}
          </p>
        </div>

        <NilaiInputGrid
          jadwalId={data.jadwal.id}
          jenisAktif={jenis}
          siswa={data.siswa}
        />

        <RiwayatNilai rows={riwayat ?? []} />
      </div>
    </main>
  );
}