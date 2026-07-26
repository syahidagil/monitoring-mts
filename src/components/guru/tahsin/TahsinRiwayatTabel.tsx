import { getTahsinBySiswa } from "@/actions/guru/tahsin.action";
import { Download, Printer } from "lucide-react";

const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu",
  KAMIS: "Kamis", JUMAT: "Jumat", SABTU: "Sabtu",
};

function Nilai({ v }: { v: string }) {
  const lancar = v === "L";
  return (
    <span
      className={
        "inline-block w-7 text-center py-0.5 rounded text-xs font-semibold " +
        (lancar ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")
      }
    >
      {lancar ? "L" : "L-"}
    </span>
  );
}

export default async function TahsinRiwayatTabel({
  siswaId,
  namaGuru,
}: {
  siswaId: number;
  namaGuru: string;
}) {
  const rows = await getTahsinBySiswa(siswaId);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-emerald-800">
          Riwayat Monitoring Tahsin Terbaru
        </h3>
        <div className="flex items-center gap-3 text-gray-400">
          <button type="button" title="Unduh" className="hover:text-gray-600">
            <Download size={16} />
          </button>
          <button type="button" title="Cetak" className="hover:text-gray-600">
            <Printer size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/70 text-[10px] text-gray-500 uppercase tracking-wide">
              <th className="text-left font-semibold px-6 py-3">No</th>
              <th className="text-left font-semibold px-3 py-3">Hari/Tanggal</th>
              <th className="text-left font-semibold px-3 py-3">Juz</th>
              <th className="text-left font-semibold px-3 py-3">Surat</th>
              <th className="text-center font-semibold px-3 py-3">Hal</th>
              <th className="text-center font-semibold px-3 py-3">Tajwid</th>
              <th className="text-center font-semibold px-3 py-3">Makhraj</th>
              <th className="text-center font-semibold px-3 py-3">Sifatul H.</th>
              <th className="text-left font-semibold px-3 py-3">Keterangan</th>
              <th className="text-left font-semibold px-6 py-3">Guru Penguji</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50/60 align-top">
                <td className="px-6 py-4 text-gray-400 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-3 py-4">
                  <p className="font-semibold text-gray-800">
                    {HARI_LABEL[t.hari] ?? t.hari}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </td>
                <td className="px-3 py-4 font-semibold text-gray-800">{t.juz}</td>
                <td className="px-3 py-4 text-gray-700">{t.surat}</td>
                <td className="px-3 py-4 text-center text-gray-600">{t.halaman}</td>
                <td className="px-3 py-4 text-center"><Nilai v={t.tajwid} /></td>
                <td className="px-3 py-4 text-center"><Nilai v={t.makhraj} /></td>
                <td className="px-3 py-4 text-center"><Nilai v={t.sifatul} /></td>
                <td className="px-3 py-4 text-gray-500 max-w-[160px]">
                  {t.keterangan ?? "–"}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {namaGuru}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-400">
                  Belum ada riwayat setoran tahsin untuk siswa ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}