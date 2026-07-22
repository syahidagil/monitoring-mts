import { getDashboardOrangTua } from "@/actions/orangtua/dashboard.action";
import { redirect } from "next/navigation";
import RingkasanCard from "@/components/orangtua/dashboard/RingkasanCard";
import AktivitasAnak from "@/components/orangtua/dashboard/AktivitasAnak";

export default async function OrangtuaDashboard() {
  const data = await getDashboardOrangTua();
  if (!data) redirect("/login");

  const totalNilai   = data.ortu.anak.reduce((a, c) => a + c._count.nilai, 0);
  const totalHafalan = data.ortu.anak.reduce((a, c) => a + c._count.hafalan, 0);
  const totalSikap   = data.ortu.anak.reduce((a, c) => a + c._count.sikap, 0);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Selamat Datang</h1>
        <p className="text-sm text-gray-500 mt-1">{data.ortu.user.name} — Portal Monitoring Anak</p>
      </div>

      <RingkasanCard
        jumlahAnak={data.ortu.anak.length}
        totalNilai={totalNilai}
        totalHafalan={totalHafalan}
        totalSikap={totalSikap}
      />

      <AktivitasAnak
        anak={data.ortu.anak}
        absensiMap={data.absensiMap}
        nilaiTerbaru={data.nilaiTerbaru}
      />
    </div>
  );
}