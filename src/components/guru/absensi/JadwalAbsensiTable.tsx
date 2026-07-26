import Link from "next/link";

type StatusJadwal = "HARI_LAIN" | "BELUM_DIMULAI" | "BERLANGSUNG" | "SELESAI";

type Row = {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelasNama: string;
  namaMapel: string;
  tahunAjaranNama: string;
  semester: string;
  status: StatusJadwal;
  sudahAbsen: boolean;
};

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

const STATUS_BADGE: Record<StatusJadwal, string> = {
  HARI_LAIN: "bg-gray-100 text-gray-500",
  BERLANGSUNG: "bg-green-100 text-green-700",
  BELUM_DIMULAI: "bg-orange-100 text-orange-700",
  SELESAI: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<StatusJadwal, string> = {
  HARI_LAIN: "Hari Lain",
  BERLANGSUNG: "Berlangsung",
  BELUM_DIMULAI: "Belum Dimulai",
  SELESAI: "Selesai",
};

export default function JadwalAbsensiTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
        Tidak ada jadwal yang sesuai dengan filter
      </div>
    );
  }

  const groups = HARI_ORDER.map((hari) => ({
    hari,
    rows: rows.filter((r) => r.hari === hari),
  })).filter((g) => g.rows.length > 0);

  let no = 0;

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.hari} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-[#1B5E20] text-white text-sm font-semibold px-4 py-2.5">
            {g.hari.charAt(0) + g.hari.slice(1).toLowerCase()} ({g.rows.length} Jadwal)
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-2 text-left font-medium">No</th>
                <th className="px-4 py-2 text-left font-medium">Tahun</th>
                <th className="px-4 py-2 text-left font-medium">Mata Pelajaran</th>
                <th className="px-4 py-2 text-left font-medium">Kelas</th>
                <th className="px-4 py-2 text-left font-medium">Jam</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {g.rows.map((r) => {
                no += 1;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{no}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.tahunAjaranNama} ({r.semester === "GANJIL" ? "Ganjil" : "Genap"})
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.namaMapel}</td>
                    <td className="px-4 py-3 text-gray-600">Kelas {r.kelasNama}</td>
                    <td className="px-4 py-3 text-gray-600">{r.jamMulai}–{r.jamSelesai}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[r.status]}`}>
                        {STATUS_LABEL[r.status].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "BELUM_DIMULAI" ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed select-none">
                          Belum Waktunya
                        </span>
                      ) : (
                        <Link
                          href={`/guru/absensi/${r.id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-colors"
                        >
                          Absen
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
