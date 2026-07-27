import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllTahunPelajaran } from "@/actions/tahunAjaran.action";
import { getKelasGuru, getMapelGuru } from "@/actions/guru/rekap.action";
import AutoSubmitForm from "@/components/shared/AutoSubmitForm";
import JadwalAbsensiTable from "@/components/guru/absensi/JadwalAbsensiTable";
import { User, IdCard, BookOpen, CalendarRange, ListChecks, Clock3, Hourglass, CheckCircle2, RotateCcw } from "lucide-react";

const HARI_OPTIONS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis", JUMAT: "Jumat", SABTU: "Sabtu",
};

type Props = {
  searchParams: Promise<{
    tahunAjaranId?: string;
    kodeMapel?: string;
    kelasId?: string;
    hari?: string;
    semuaHari?: string;
    f?: string;
  }>;
};

export default async function GuruAbsensiPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") redirect("/login");
  const guruId = session.user.id;
  const params = await searchParams;

  const submitted = params.f === "1";
  const semuaHari = submitted ? params.semuaHari === "on" : true;

  const [guru, tahunAjaranAktif, tahunAjaranList, mapelList, kelasList] = await Promise.all([
    prisma.guru.findUnique({
      where: { id: guruId },
      include: { user: { select: { name: true } } },
    }),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
    getAllTahunPelajaran(),
    getMapelGuru(),
    getKelasGuru(),
  ]);

  const tahunAjaranId = params.tahunAjaranId ? Number(params.tahunAjaranId) : tahunAjaranAktif?.id;
  const kodeMapel = params.kodeMapel || undefined;
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const hari = params.hari || undefined;

  const jadwal = await prisma.jadwal.findMany({
    where: {
      guruId,
      ...(tahunAjaranId && { tahunAjaranId }),
      ...(kodeMapel && { kodeMapel }),
      ...(kelasId && { kelasId }),
      ...(!semuaHari && hari && { hari: hari as any }),
    },
    include: {
      kelas: { select: { nama: true } },
      mataPelajaran: { select: { namaMapel: true } },
      tahunAjaran: { select: { nama: true, semester: true } },
    },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayName = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][new Date().getDay()];
  const nowStr = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const absenHariIni = await prisma.absensi.findMany({
    where: { guruId, tanggal: { gte: today } },
    select: { jadwalId: true },
    distinct: ["jadwalId"],
  });
  const sudahAbsenSet = new Set(absenHariIni.map((a) => a.jadwalId));

  const rows = jadwal.map((j) => {
    let status: "HARI_LAIN" | "BELUM_DIMULAI" | "BERLANGSUNG" | "SELESAI";
    if (j.hari !== todayName) status = "HARI_LAIN";
    else if (nowStr < j.jamMulai) status = "BELUM_DIMULAI";
    else if (nowStr <= j.jamSelesai) status = "BERLANGSUNG";
    else status = "SELESAI";

    return {
      id: j.id,
      hari: j.hari,
      jamMulai: j.jamMulai,
      jamSelesai: j.jamSelesai,
      kelasNama: j.kelas.nama,
      namaMapel: j.mataPelajaran.namaMapel,
      tahunAjaranNama: j.tahunAjaran.nama,
      semester: j.tahunAjaran.semester,
      status,
      sudahAbsen: sudahAbsenSet.has(j.id),
    };
  });

  const stats = {
    total: rows.length,
    berlangsung: rows.filter((r) => r.status === "BERLANGSUNG").length,
    belumDimulai: rows.filter((r) => r.status === "BELUM_DIMULAI").length,
    selesai: rows.filter((r) => r.status === "SELESAI").length,
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Absensi Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih jadwal untuk mengisi absensi</p>
        </div>

        {/* Kartu Profil Guru */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-wrap items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-[#1B5E20]" />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-gray-400">Nama Guru</p>
              <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><IdCard className="w-3 h-3" /> NIP</p>
              <p className="text-sm font-semibold text-gray-800">{guru?.nip || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Mata Pelajaran</p>
              <p className="text-sm font-semibold text-gray-800">{guru?.mapel || "-"}</p>
            </div>
          </div>
        </div>

        {/* Kartu Rekap Presensi Mengajar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-4 h-4 text-[#1B5E20]" />
            <h2 className="text-sm font-bold text-gray-800">Rekap Presensi Mengajar</h2>
          </div>
          <form action="/guru/rekap/absensi" method="get" className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dari Tanggal</label>
              <input type="date" name="mulai"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sampai Tanggal</label>
              <input type="date" name="akhir"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit"
              className="bg-[#1B5E20] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
              Lihat Rekap Mengajar
            </button>
          </form>
        </div>

        {/* Kartu Filter Jadwal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Filter Jadwal</h2>
            <Link href="/guru/absensi"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </Link>
          </div>
          <AutoSubmitForm className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="f" value="1" />
            <select name="tahunAjaranId" defaultValue={tahunAjaranId ?? ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              {tahunAjaranList.map((t) => (
                <option key={t.id} value={t.id}>{t.nama} ({t.semester === "GANJIL" ? "Ganjil" : "Genap"})</option>
              ))}
            </select>
            <select name="kodeMapel" defaultValue={kodeMapel ?? ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Semua Mata Pelajaran</option>
              {mapelList.map((m) => <option key={m.kodeMapel} value={m.kodeMapel}>{m.namaMapel}</option>)}
            </select>
            <select name="kelasId" defaultValue={kelasId ?? ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
            </select>
            <select name="hari" defaultValue={hari ?? ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Pilih Hari</option>
              {HARI_OPTIONS.map((h) => <option key={h} value={h}>{HARI_LABEL[h]}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="semuaHari" value="on" defaultChecked={semuaHari}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              Tampilkan Semua Hari
            </label>
          </AutoSubmitForm>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Jadwal</p>
              <p className="text-lg font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Berlangsung</p>
              <p className="text-lg font-bold text-gray-800">{stats.berlangsung}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Belum Dimulai</p>
              <p className="text-lg font-bold text-gray-800">{stats.belumDimulai}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Selesai</p>
              <p className="text-lg font-bold text-gray-800">{stats.selesai}</p>
            </div>
          </div>
        </div>

        <JadwalAbsensiTable rows={rows} />
      </div>
    </div>
  );
}