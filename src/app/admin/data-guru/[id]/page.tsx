import { getGuruById } from "@/actions/guru.action";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, User, Phone, MapPin,
  GraduationCap, BookOpen, Shield, CheckCircle, XCircle
} from "lucide-react";

export default async function DetailGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guru = await getGuruById(id);
  if (!guru) notFound();

  const createdAt = new Date(guru.user.createdAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/data-guru"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Guru</h1>
            <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap data guru</p>
          </div>
        </div>
        <Link href="/admin/data-guru"
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Edit className="w-4 h-4" /> Edit Data
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{guru.user.name?.charAt(0) ?? "G"}</span>
          </div>
          <div className="text-white flex-1">
            <h2 className="text-lg font-bold">{guru.user.name}</h2>
            <p className="text-green-200 text-sm mt-0.5">NIP: {guru.nip ?? "Belum diisi"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${guru.user.status ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                {guru.user.status ? "Aktif" : "Nonaktif"}
              </span>
              {guru._count.jadwal > 0 && (
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {guru._count.jadwal} Jadwal Mengajar
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Info Profil */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <User className="w-3.5 h-3.5" /> Informasi Profil
            </h3>
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={guru.user.name ?? "-"} />
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="NIP" value={guru.nip ?? "-"} mono />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Nomor HP" value={guru.noHp ?? "-"} />
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Pendidikan Terakhir" value={guru.pendidikan ?? "-"} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat" value={guru.alamat ?? "-"} multiline />
          </div>

          {/* Akun & Mapel */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <Shield className="w-3.5 h-3.5" /> Akun &amp; Mata Pelajaran
            </h3>
            <InfoRow icon={<Shield className="w-4 h-4" />} label="Username" value={guru.user.username} mono />
            <InfoRow icon={guru.user.status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              label="Status Akun"
              value={guru.user.status ? "Aktif" : "Nonaktif"}
              badge={guru.user.status ? "green" : "red"} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Bergabung Sejak" value={createdAt} />

            {/* Mata Pelajaran Diampu */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-2">Mata Pelajaran Diampu</p>
                {guru.guruMapel && guru.guruMapel.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {guru.guruMapel.map((gm: any) => (
                      <span key={gm.idGuruMapel}
                        className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {gm.mataPelajaran.namaMapel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    Belum ada mapel diampu
                  </span>
                )}
              </div>
            </div>

            {/* Kelas Wali */}
            {guru.kelasWali && guru.kelasWali.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-2">Wali Kelas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {guru.kelasWali.map((k: any) => (
                      <span key={k.id}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                        {k.nama}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
