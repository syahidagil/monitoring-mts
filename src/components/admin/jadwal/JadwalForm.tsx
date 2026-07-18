"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJadwal, updateJadwal } from "@/actions/jadwal.action";
import { Save, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

const HARI_LIST = ["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
const JAM_LIST = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00"];

type Props = {
  kelas: any[];
  guru: any[];
  mapel: any[];
  defaultValues?: any;
  isEdit?: boolean;
  jadwalId?: number;
};

export default function JadwalForm({ kelas, guru, mapel, defaultValues, isEdit, jadwalId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit && jadwalId
        ? await updateJadwal(jadwalId, fd)
        : await createJadwal(fd);
      if (result.success) {
        setSuccess(true);
        if (isEdit) router.push("/admin/jadwal");
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
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-800">Jadwal berhasil {isEdit ? "diperbarui" : "ditambahkan"}!</p>
          <button type="button" onClick={() => setSuccess(false)} className="ml-auto text-green-400 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1B5E20] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Form Input Jadwal Pelajaran</h2>
            <p className="text-green-300 text-xs">Atur jadwal mata pelajaran per kelas</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Kelas <span className="text-red-500">*</span></label>
            <select name="kelasId" defaultValue={defaultValues?.kelasId ?? ""} required className={inputClass}>
              <option value="">-- Pilih Kelas --</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>Kelas {k.nama} - {k.tahunAjaran.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Guru Pengajar <span className="text-red-500">*</span></label>
            <select name="guruId" defaultValue={defaultValues?.guruId ?? ""} required className={inputClass}>
              <option value="">-- Pilih Guru --</option>
              {guru.map((g) => (
                <option key={g.id} value={g.id}>{g.user.name} ({g.mapel})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
            <select name="mapel" defaultValue={defaultValues?.mapel ?? ""} required className={inputClass}
              onChange={(e) => {
                const val = e.target.value;
                const input = e.target.closest("form")?.querySelector('input[name="mapelCustom"]') as HTMLInputElement;
                if (input) input.value = val;
              }}>
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapel.map((m) => (
                <option key={m.kodeMapel} value={m.namaMapel}>{m.namaMapel} ({m.kodeMapel})</option>
              ))}
            </select>
            <input type="hidden" name="mapel" defaultValue={defaultValues?.mapel} />
          </div>

          <div>
            <label className={labelClass}>Hari <span className="text-red-500">*</span></label>
            <select name="hari" defaultValue={defaultValues?.hari ?? ""} required className={inputClass}>
              <option value="">-- Pilih Hari --</option>
              {HARI_LIST.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Jam Mulai <span className="text-red-500">*</span></label>
            <select name="jamMulai" defaultValue={defaultValues?.jamMulai ?? ""} required className={inputClass}>
              <option value="">-- Pilih Jam Mulai --</option>
              {JAM_LIST.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Jam Selesai <span className="text-red-500">*</span></label>
            <select name="jamSelesai" defaultValue={defaultValues?.jamSelesai ?? ""} required className={inputClass}>
              <option value="">-- Pilih Jam Selesai --</option>
              {JAM_LIST.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Sistem akan otomatis memeriksa bentrok jadwal pada kelas dan hari yang sama.
          </div>
          <div className="flex gap-3">
            <Link href="/admin/jadwal"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
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