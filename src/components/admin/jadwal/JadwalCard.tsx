const HARI_COLOR: Record<string, string> = {
  SENIN: "border-l-blue-500 bg-blue-50",
  SELASA: "border-l-purple-500 bg-purple-50",
  RABU: "border-l-green-500 bg-green-50",
  KAMIS: "border-l-yellow-500 bg-yellow-50",
  JUMAT: "border-l-orange-500 bg-orange-50",
  SABTU: "border-l-pink-500 bg-pink-50",
};

export default function JadwalCard({ jadwal }: { jadwal: any[] }) {
  const byHari: Record<string, any[]> = {};
  jadwal.forEach((j) => {
    if (!byHari[j.hari]) byHari[j.hari] = [];
    byHari[j.hari].push(j);
  });

  const HARI_ORDER = ["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {HARI_ORDER.filter((h) => byHari[h]).map((hari) => (
        <div key={hari} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">{hari}</h3>
          </div>
          <div className="p-3 space-y-2">
            {byHari[hari].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai)).map((j) => (
              <div key={j.id} className={`border-l-4 ${HARI_COLOR[hari]} rounded-r-lg px-3 py-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{j.mapel}</span>
                  <span className="text-xs font-mono text-gray-500">{j.jamMulai}–{j.jamSelesai}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{j.guru.user.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}