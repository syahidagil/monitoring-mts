// Komponen bersama (dipakai halaman guru DAN orang tua) supaya tampilannya
// identik. Sengaja tanpa "use client": murni tampilan, tanpa state/hook.

export type TahsinKelancaranRow = {
  id?: number;
  tanggal: Date | string;
  surat: string;
  tajwid: string; // "L" | "L_MIN"
  makhraj: string;
  sifatul: string;
  keterangan?: string | null;
  guruNama?: string | null;
};

const ASPEK = [
  { key: "tajwid", label: "Tajwid" },
  { key: "makhraj", label: "Makhraj" },
  { key: "sifatul", label: "Sifatul Huruf" },
] as const;

const JUMLAH_TIMELINE = 10;

function tgl(t: Date | string) {
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC", // kolom tanggal bertipe DATE (tanpa jam), jangan digeser zona waktu
  });
}

function teksNilai(v: string) {
  return v === "L" ? "L" : "L-";
}

const BADGE = {
  L: "bg-green-100 text-green-700",
  LMIN: "bg-amber-100 text-amber-700",
};
const DOT = {
  L: "bg-green-500",
  LMIN: "bg-amber-400",
};

export default function TahsinKelancaran({ rows }: { rows: TahsinKelancaranRow[] }) {
  // Urut terbaru -> terlama (tanggal, lalu id sebagai pemisah supaya hasilnya
  // selalu sama di halaman guru maupun orang tua).
  const urut = [...rows].sort((a, b) => {
    const selisih = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    return selisih !== 0 ? selisih : (b.id ?? 0) - (a.id ?? 0);
  });

  if (urut.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-bold text-gray-800">Kelancaran Bacaan Tahsin</h2>
        <p className="text-xs text-gray-400 mt-2">Belum ada setoran tahsin.</p>
      </div>
    );
  }

  const terakhir = urut[0];
  const timeline = urut.slice(0, JUMLAH_TIMELINE).reverse(); // kiri = terlama, kanan = terbaru
  const catatan = urut.find((r) => (r.keterangan ?? "").trim() !== "");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Kelancaran Bacaan Tahsin</h2>
          <p className="text-xs text-gray-400 mt-0.5">Kondisi terkini dari seluruh riwayat setoran</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${DOT.L}`} /> L = lancar
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${DOT.LMIN}`} /> L- = lancar dengan catatan
          </span>
        </div>
      </div>

      {/* 1. Status setoran terakhir */}
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Setoran terakhir</p>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">
        {tgl(terakhir.tanggal)} - {terakhir.surat}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {ASPEK.map((a) => {
          const v = terakhir[a.key];
          return (
            <div key={a.key} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
              <p className="text-[11px] text-gray-500 mb-1.5">{a.label}</p>
              <span
                className={`inline-block text-sm font-bold px-3 py-1 rounded-lg ${
                  v === "L" ? BADGE.L : BADGE.LMIN
                }`}
              >
                {teksNilai(v)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Garis waktu kelancaran */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Riwayat {timeline.length} setoran terakhir
        </p>
        <div className="space-y-2.5">
          {ASPEK.map((a) => (
            <div key={a.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-gray-600">{a.label}</span>
              <div className="flex items-center gap-1.5">
                {timeline.map((r, i) => (
                  <span
                    key={r.id ?? i}
                    title={`${tgl(r.tanggal)} - ${r.surat}: ${teksNilai(r[a.key])}`}
                    className={`w-5 h-5 rounded-full ${r[a.key] === "L" ? DOT.L : DOT.LMIN}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          {timeline.length === 1 ? (
            "Baru ada 1 setoran, jadi pola kelancaran belum terlihat."
          ) : (
            <>
              Dari terlama (kiri, {tgl(timeline[0].tanggal)}) sampai terbaru (kanan,{" "}
              {tgl(timeline[timeline.length - 1].tanggal)}).
            </>
          )}
        </p>
      </div>

      {/* 4. Catatan guru terakhir */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan guru terakhir</p>
        {catatan ? (
          <blockquote className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5">
            <p className="text-sm text-gray-700 leading-relaxed">{catatan.keterangan}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              {tgl(catatan.tanggal)} - {catatan.surat}
              {catatan.guruNama ? ` - ${catatan.guruNama}` : ""}
            </p>
          </blockquote>
        ) : (
          <p className="text-xs text-gray-400">Belum ada catatan dari guru.</p>
        )}
      </div>
    </div>
  );
}
