import { getSiswaById } from "@/actions/siswa.action";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, User, GraduationCap, MapPin, Calendar,
  Phone, Users, BookOpen, CheckCircle, XCircle
} from "lucide-react";

export default async function DetailSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siswa = await getSiswaById(Number(id));
  if (!siswa) notFound();

  const tglLahir = siswa.tanggalLahir
    ? new Date(siswa.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/data-siswa"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Siswa</h1>
            <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap data siswa</p>
          </div>
        </div>
        <Link href={`/admin/data-siswa/${id}/edit`}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Edit className="w-4 h-4" /> Edit Data
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{siswa.nama.charAt(0)}</span>
          </div>
          <div className="text-white">
            <h2 className="text-lg font-bold">{siswa.nama}</h2>
            <p className="text-green-200 text-sm mt-0.5">NIS: {siswa.nis}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {siswa.kelas?.nama ?? "-"}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${siswa.status ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                {siswa.status ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Data Pribadi */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <User className="w-3.5 h-3.5" /> Data Pribadi
            </h3>
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="NIS" value={siswa.nis} mono />
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={siswa.nama} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Jenis Kelamin"
              value={siswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Tempat Lahir"
              value={siswa.tempatLahir ?? "-"} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Lahir" value={tglLahir} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat"
              value={siswa.alamat ?? "-"} multiline />
          </div>

          {/* Data Akademik & Keluarga */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <BookOpen className="w-3.5 h-3.5" /> Akademik &amp; Keluarga
            </h3>
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Kelas"
              value={siswa.kelas ? `${siswa.kelas.nama} — ${siswa.kelas.tahunAjaran?.nama}` : "-"} />
            <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Status Tahfidz"
              value={siswa.statusTahfidz ? "Aktif Program" : "Tidak Aktif"}
              badge={siswa.statusTahfidz ? "green" : "gray"} />
            <InfoRow icon={<Users className="w-4 h-4" />} label="Nama Ayah"
              value={siswa.namaAyah ?? "-"} />
            <InfoRow icon={<Users className="w-4 h-4" />} label="Nama Ibu"
              value={siswa.namaIbu ?? "-"} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Wali / Orang Tua"
              value={siswa.orangTua ? siswa.orangTua.user.name ?? "-" : "Belum terhubung"} />
            <InfoRow icon={siswa.status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              label="Status Siswa"
              value={siswa.status ? "Aktif" : "Nonaktif"}
              badge={siswa.status ? "green" : "red"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono, multiline, badge }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
  badge?: "green" | "red" | "gray" | "blue";
}) {
  const badgeClass: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-gray-500",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        {badge ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass[badge]}`}>{value}</span>
        ) : (
          <p className={`text-sm font-medium text-gray-800 ${mono ? "font-mono" : ""} ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
