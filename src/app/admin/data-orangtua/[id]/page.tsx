import { getOrangTuaById } from "@/actions/orangtua.action";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, User, Phone, MapPin,
  Briefcase, Shield, Users, CheckCircle, XCircle, GraduationCap
} from "lucide-react";

export default async function DetailOrangtuaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ortu = await getOrangTuaById(id);
  if (!ortu) notFound();

  const createdAt = new Date(ortu.user.createdAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/data-orangtua"
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Detail Orang Tua / Wali</h1>
            <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap data wali siswa</p>
          </div>
        </div>
        <Link href={`/admin/data-orangtua/${id}/edit`}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Edit className="w-4 h-4" /> Edit Data
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{ortu.user.name?.charAt(0) ?? "W"}</span>
          </div>
          <div className="text-white flex-1">
            <h2 className="text-lg font-bold">{ortu.user.name}</h2>
            <p className="text-green-200 text-sm mt-0.5">{ortu.pekerjaan ?? "Pekerjaan belum diisi"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ortu.user.status ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                {ortu.user.status ? "Aktif" : "Nonaktif"}
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {ortu._count.anak} Anak Terdaftar
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Info Pribadi */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <User className="w-3.5 h-3.5" /> Informasi Pribadi
            </h3>
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={ortu.user.name ?? "-"} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Nomor HP" value={ortu.noHp ?? "-"} />
            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Pekerjaan" value={ortu.pekerjaan ?? "-"} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat" value={ortu.alamat ?? "-"} multiline />
          </div>

          {/* Akun & Anak */}
          <div className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">
              <Shield className="w-3.5 h-3.5" /> Akun &amp; Relasi Siswa
            </h3>
            <InfoRow icon={<Shield className="w-4 h-4" />} label="Username" value={ortu.user.username} mono />
            <InfoRow icon={ortu.user.status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              label="Status Akun"
              value={ortu.user.status ? "Aktif" : "Nonaktif"}
              badge={ortu.user.status ? "green" : "red"} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Bergabung Sejak" value={createdAt} />

            {/* Daftar Anak */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-2">Siswa yang Diwalikan</p>
                {ortu.anak && ortu.anak.length > 0 ? (
                  <div className="space-y-2">
                    {ortu.anak.map((anak: any) => (
                      <Link key={anak.id} href={`/admin/data-siswa/${anak.id}`}
                        className="flex items-center gap-3 p-2.5 bg-green-50 border border-green-100 rounded-lg hover:border-green-300 transition-colors group">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-green-700">{anak.nama.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-green-700">{anak.nama}</p>
                          <p className="text-xs text-gray-400">{anak.nis} • {anak.kelas?.nama ?? "-"}</p>
                        </div>
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    Belum ada siswa diwalikan
                  </span>
                )}
              </div>
            </div>
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
