"use client";
import { useState, useTransition, useCallback } from "react";
import { saveAbsensiKelas, getAbsensiByJadwalTanggal, getCatatanUmum } from "@/actions/guru/absensi.action";
import { Save, ArrowLeft, FileText, Info, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "ALPHA", label: "ALPA"  },
  { value: "HADIR", label: "HADIR" },
  { value: "IZIN",  label: "IZIN"  },
  { value: "SAKIT", label: "SAKIT" },
];

type Siswa = { id: number; nis: string; nama: string };

type Props = {
  jadwalId:          number;
  tanggal:           string;
  siswaList:         Siswa[];
  existingAbsensi?:  { siswaId: number; status: string; keterangan?: string | null }[];
  catatanUmum?:      string;
  jadwalInfo:        {
    mapel:      string;
    kelas:      string;
    tingkat:    number;
    hari:       string;
    jamMulai:   string;
    jamSelesai: string;
  };
  guruInfo: {
    nama:  string;
    nip:   string | null;
    mapel: string;
  };
};

export default function AbsensiForm({
  jadwalId, tanggal, siswaList, existingAbsensi = [], catatanUmum = "", jadwalInfo, guruInfo,
}: Props) {
  const [isPending,  startTransition] = useTransition();
  const [success,    setSuccess]      = useState("");
  const [error,      setError]        = useState("");
  const [tglInput,   setTglInput]     = useState(tanggal);
  const [ketUmum,    setKetUmum]      = useState(catatanUmum);
  const [rekapMulai, setRekapMulai]   = useState("");
  const [rekapAkhir, setRekapAkhir]   = useState("");

  const [statuses, setStatuses] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    siswaList.forEach((s) => {
      const ex = existingAbsensi.find((e) => e.siswaId === s.id);
      init[s.id] = ex?.status ?? "HADIR";
    });
    return init;
  });

  const [ketMap, setKetMap] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    existingAbsensi.forEach((e) => { if (e.keterangan) init[e.siswaId] = e.keterangan; });
    return init;
  });

  const [invalidKetIds, setInvalidKetIds] = useState<Set<number>>(new Set());
  const [isLoadingDate, setIsLoadingDate] = useState(false);

  // Reset form saat tanggal berubah — fetch data absensi baru untuk tanggal tsb
  const handleTanggalChange = useCallback(async (newTgl: string) => {
    setTglInput(newTgl);
    if (!newTgl) return;
    setIsLoadingDate(true);
    setSuccess("");
    setError("");
    setInvalidKetIds(new Set());
    try {
      const [data, catatan] = await Promise.all([
        getAbsensiByJadwalTanggal(jadwalId, newTgl),
        getCatatanUmum(jadwalId, newTgl),
      ]);
      // Reset statuses dan keterangan berdasarkan data tanggal baru
      const newStatuses: Record<number, string> = {};
      const newKetMap: Record<number, string> = {};
      siswaList.forEach((s) => {
        const ex = data.find((e: any) => e.siswaId === s.id);
        newStatuses[s.id] = ex?.status ?? "HADIR";
        if (ex?.keterangan) newKetMap[s.id] = ex.keterangan;
      });
      setStatuses(newStatuses);
      setKetMap(newKetMap);
      setKetUmum(catatan ?? "");
    } finally {
      setIsLoadingDate(false);
    }
  }, [jadwalId, siswaList]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");

    const belumTerisi = siswaList.filter(
      (s) => statuses[s.id] !== "HADIR" && !(ketMap[s.id] ?? "").trim()
    );
    if (belumTerisi.length > 0) {
      setInvalidKetIds(new Set(belumTerisi.map((s) => s.id)));
      setError(
        `Keterangan belum diisi untuk: ${belumTerisi.map((s) => s.nama).join(", ")}. ` +
          `Siswa dengan status selain HADIR wajib diisi keterangannya.`
      );
      return;
    }
    setInvalidKetIds(new Set());

    const fd = new FormData();
    fd.set("jadwalId", String(jadwalId));
    fd.set("tanggal",  tglInput);
    fd.set("catatanUmum", ketUmum);
    siswaList.forEach((s) => {
      fd.set(`status_${s.id}`, statuses[s.id] ?? "HADIR");
      if (ketMap[s.id]) fd.set(`ket_${s.id}`, ketMap[s.id]);
    });
    startTransition(async () => {
      const result = await saveAbsensiKelas(fd);
      if (result.success) setSuccess(result.message);
      else setError(result.message);
    });
  }

  const rekap = Object.values(statuses).reduce((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 self-start w-full">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-[#1B5E20]">
        Absensi {jadwalInfo.mapel}
      </h1>

      {/* ── ALERTS ──────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* ── BARIS 1: INFO JADWAL + PENGATURAN ───────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Kartu Info Jadwal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-[#1B5E20] border-l-4 border-[#1B5E20] pl-3 mb-5">
            Informasi Jadwal
          </h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm mb-5">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Mata Pelajaran:</p>
              <p className="font-bold text-gray-800">{jadwalInfo.mapel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Kelas:</p>
              <p className="font-bold text-gray-800">{jadwalInfo.tingkat}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Hari:</p>
              <p className="font-bold text-gray-800 capitalize">{jadwalInfo.hari}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Jam:</p>
              <p className="font-bold text-gray-800">{jadwalInfo.jamMulai} - {jadwalInfo.jamSelesai}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-700 mb-2">Data Guru</p>
            <p className="text-xs text-gray-500">Nama Guru: <span className="font-semibold text-gray-700">{guruInfo.nama}</span></p>
            {guruInfo.nip && <p className="text-xs text-gray-500 mt-1">NIP: <span className="font-semibold text-gray-700">{guruInfo.nip}</span></p>}
            <p className="text-xs text-gray-500 mt-1">Pengampu: <span className="font-semibold text-gray-700">{guruInfo.mapel}</span></p>
          </div>
        </div>

        {/* Kartu Pengaturan Absensi */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-[#1B5E20] border-l-4 border-[#1B5E20] pl-3 mb-5">
            Pengaturan Absensi
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tanggal Absensi</label>
              <input
                type="date"
                value={tglInput}
                onChange={(e) => handleTanggalChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              {isLoadingDate && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                  Memuat data absensi untuk tanggal ini...
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Keterangan Umum</label>
              <textarea
                value={ketUmum}
                onChange={(e) => setKetUmum(e.target.value)}
                rows={4}
                placeholder="Keterangan untuk seluruh kelas (opsional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TOMBOL AKSI ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit as any}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {isPending ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
          ) : (
            <><Save className="w-4 h-4" />Simpan Absensi</>
          )}
        </button>
        <Link href="/guru/absensi"
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      {/*  */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1B5E20]" />
            <h2 className="text-sm font-bold text-gray-800">Rekap Absensi</h2>
          </div>
          <span className="text-[10px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-full">FITUR BARU</span>
        </div> */}

        {/* <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tanggal Awal</label>
              <input type="date" value={rekapMulai} onChange={(e) => setRekapMulai(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tanggal Akhir</label>
              <input type="date" value={rekapAkhir} onChange={(e) => setRekapAkhir(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            </div>
            <Link
              href={`/guru/rekap/absensi?jadwalId=${jadwalId}&mulai=${rekapMulai}&akhir=${rekapAkhir}`}
              className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              <FileText className="w-4 h-4" /> Lihat Rekap Lengkap
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              Pilih rentang tanggal untuk melihat rekap lengkap absensi siswa dari mata pelajaran {jadwalInfo.mapel}
            </p>
          </div>
        </div> */}

        {/* Rekap cepat */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <span>{siswaList.length} siswa</span>
          {["HADIR","ALPHA","IZIN","SAKIT"].map((s) => (
            rekap[s] ? (
              <span key={s} className={`font-semibold ${
                s === "HADIR" ? "text-green-600" :
                s === "ALPHA" ? "text-red-600"   :
                s === "IZIN"  ? "text-yellow-600" :
                "text-blue-600"
              }`}>{s[0]}: {rekap[s]}</span>
            ) : null
          ))}
          <span className="ml-auto text-gray-300">Sistem Monitoring MTS Al-Amin Bintaro v2.0</span>
        </div>

        {/* ── TABEL ABSENSI ─────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1B5E20] text-white">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider w-48">Nama</th>
                {STATUS_OPTIONS.map((s) => (
                  <th key={s.value} className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider w-20">
                    {s.label}
                  </th>
                ))}
                <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {siswaList.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-gray-800 uppercase">{siswa.nama}</p>
                  </td>
                  {STATUS_OPTIONS.map((opt) => (
                    <td key={opt.value} className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setStatuses((prev) => ({ ...prev, [siswa.id]: opt.value }));
                          if (opt.value === "HADIR") {
                            setInvalidKetIds((prev) => {
                              if (!prev.has(siswa.id)) return prev;
                              const next = new Set(prev);
                              next.delete(siswa.id);
                              return next;
                            });
                          }
                        }}
                        className="inline-flex items-center justify-center p-1 rounded-full focus:outline-none"
                      >
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          statuses[siswa.id] === opt.value
                            ? "border-[#1B5E20] bg-[#1B5E20]"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}>
                          {statuses[siswa.id] === opt.value && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-3.5">
                    <input
                      type="text"
                      value={ketMap[siswa.id] ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setKetMap((prev) => ({ ...prev, [siswa.id]: value }));
                        if (value.trim()) {
                          setInvalidKetIds((prev) => {
                            if (!prev.has(siswa.id)) return prev;
                            const next = new Set(prev);
                            next.delete(siswa.id);
                            return next;
                          });
                        }
                      }}
                      placeholder={statuses[siswa.id] !== "HADIR" ? "Wajib diisi" : "Tulis deskripsi"}
                      className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 bg-gray-50 hover:bg-white transition-colors ${
                        invalidKetIds.has(siswa.id)
                          ? "border-red-400 focus:ring-red-400 bg-red-50"
                          : "border-gray-200 focus:ring-green-400"
                      }`}
                    />
                    {invalidKetIds.has(siswa.id) && (
                      <p className="text-[10px] text-red-500 mt-1">Keterangan belum diisi</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}