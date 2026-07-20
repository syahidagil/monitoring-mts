"use client";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createJadwal, updateJadwal, getGuruByMapel } from "@/actions/jadwal.action";
import { Save, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

const HARI_OPTIONS = [
  { value: "SENIN",   label: "Senin" },
  { value: "SELASA",  label: "Selasa" },
  { value: "RABU",    label: "Rabu" },
  { value: "KAMIS",   label: "Kamis" },
  { value: "JUMAT",   label: "Jumat" },
  { value: "SABTU",   label: "Sabtu" },
];

type Props = {
  kelas: any[];
  guru: any[];
  mapel: any[];
  tahunAjaran: any[];
  defaultValues?: any;
  isEdit?: boolean;
  jadwalId?: number;
};

export default function JadwalForm({
  kelas, guru, mapel, tahunAjaran, defaultValues, isEdit, jadwalId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  // Dropdown guru difilter berdasarkan mapel yang dipilih
  const [filteredGuru, setFilteredGuru] = useState<any[]>(guru);
  const [selectedGuruId, setSelectedGuruId] = useState(defaultValues?.guruId ?? "");
  const [isFilteringGuru, setIsFilteringGuru] = useState(false);

  // Default tahun ajaran aktif
  const defaultTaId = tahunAjaran.find((ta) => ta.aktif)?.id ?? tahunAjaran[0]?.id ?? "";

  const handleMapelChange = useCallback(async (kodeMapel: string) => {
    if (!kodeMapel) { setFilteredGuru(guru); return; }
    setIsFilteringGuru(true);
    try {
      const result = await getGuruByMapel(kodeMapel);
      if (result.length === 0) {
        setFilteredGuru(guru); // fallback semua guru
      } else {
        const ids = new Set(result.map((r: any) => r.guru.id));
        const mapped = result.map((r: any) => r.guru);
        setFilteredGuru(mapped);
        // Reset pilihan guru jika guru terpilih tidak mengajar mapel ini
        if (!ids.has(selectedGuruId)) setSelectedGuruId("");
      }
    } finally {
      setIsFilteringGuru(false);
    }
  }, [guru, selectedGuruId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess(""); setWarning("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && jadwalId
        ? await updateJadwal(jadwalId, fd)
        : await createJadwal(fd);
      if (result.success) {
        setSuccess("Jadwal berhasil disimpan!");
        if (result.warning) setWarning(result.warning);
        if (isEdit) setTimeout(() => router.push("/admin/jadwal"), 1200);
        else (e.target as HTMLFormElement).reset();
      } else {
        setError(result.message);
      }
    });
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">{success}</p>
          <button type="button" onClick={() => setSuccess("")} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {warning && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5">
          <Info className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">{warning}</p>
          <button type="button" onClick={() => setWarning("")} className="ml-auto text-yellow-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Baris 1 ── */}
          {/* Hari */}
          <div>
            <label className={labelClass}>Hari <span className="text-red-500">*</span></label>
            <select name="hari" defaultValue={defaultValues?.hari ?? ""} required className={inputClass}>
              <option value="">Pilih Hari</option>
              {HARI_OPTIONS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
            <select
              name="kodeMapel"
              defaultValue={defaultValues?.kodeMapel ?? ""}
              required
              className={inputClass}
              onChange={(e) => handleMapelChange(e.target.value)}
            >
              <option value="">Pilih Mata Pelajaran</option>
              {mapel.map((m) => (
                <option key={m.kodeMapel} value={m.kodeMapel}>{m.namaMapel}</option>
              ))}
            </select>
          </div>

          {/* ── Baris 2 ── */}
          {/* Jam (Mulai + Selesai dalam 1 kolom) */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Jam Mulai <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="jamMulai"
                  type="time"
                  defaultValue={defaultValues?.jamMulai ?? "07:30"}
                  required
                  min="07:00"
                  max="16:00"
                  className={`${inputClass} pr-10`}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Jam Selesai <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="jamSelesai"
                  type="time"
                  defaultValue={defaultValues?.jamSelesai ?? "09:00"}
                  required
                  min="07:00"
                  max="16:00"
                  className={`${inputClass} pr-10`}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Guru Pengampu */}
          <div>
            <label className={labelClass}>
              Guru Pengampu <span className="text-red-500">*</span>
              {isFilteringGuru && (
                <span className="ml-2 text-xs font-normal text-green-600">Memuat...</span>
              )}
            </label>
            <select
              name="guruId"
              value={selectedGuruId}
              required
              onChange={(e) => setSelectedGuruId(e.target.value)}
              className={inputClass}
            >
              <option value="">Pilih Guru</option>
              {filteredGuru.map((g) => (
                <option key={g.id} value={g.id}>{g.user.name}</option>
              ))}
            </select>
            {filteredGuru.length < guru.length && filteredGuru.length > 0 && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Menampilkan {filteredGuru.length} guru yang mengajar mata pelajaran ini
              </p>
            )}
          </div>

          {/* ── Baris 3 ── */}
          {/* Kelas */}
          <div>
            <label className={labelClass}>Kelas <span className="text-red-500">*</span></label>
            <select name="kelasId" defaultValue={defaultValues?.kelasId ?? ""} required className={inputClass}>
              <option value="">Pilih Kelas</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} {k.tahunAjaran ? `- ${k.tahunAjaran.nama}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Semester / Tahun Ajaran */}
          <div>
            <label className={labelClass}>Semester <span className="text-red-500">*</span></label>
            <select name="tahunAjaranId" defaultValue={defaultValues?.tahunAjaranId ?? defaultTaId} required className={inputClass}>
              <option value="">Pilih Semester</option>
              {tahunAjaran.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  Semester {ta.semester} - {ta.nama} {ta.aktif ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-6 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Sistem akan memeriksa bentrok jadwal secara otomatis saat menyimpan.
          </div>
          <div className="flex gap-3">
            <Link href="/admin/jadwal"
              className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-green-800 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" />{isEdit ? "Simpan Perubahan" : "Simpan Jadwal"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}