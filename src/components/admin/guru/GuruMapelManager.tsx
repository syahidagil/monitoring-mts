"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Trash2, X, AlertCircle, CheckCircle, Search, GraduationCap } from "lucide-react";
import { assignGuruMapel, removeGuruMapel } from "@/actions/guru.action";

type MapelItem = { kodeMapel: string; namaMapel: string };
type GuruMapelItem = { idGuruMapel: number; kodeMapel: string; mataPelajaran: { namaMapel: string } };

type Props = {
  guruId: string;
  guruNama: string;
  guruMapel: GuruMapelItem[];
  allMapel: MapelItem[];
};

export default function GuruMapelManager({ guruId, guruNama, guruMapel, allMapel }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedKode, setSelectedKode] = useState("");

  const assignedCodes = new Set(guruMapel.map((gm) => gm.kodeMapel));
  const availableMapel = allMapel.filter(
    (mp) => !assignedCodes.has(mp.kodeMapel) &&
      mp.namaMapel.toLowerCase().includes(search.toLowerCase())
  );

  function showMsg(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleAssign() {
    if (!selectedKode) return;
    startTransition(async () => {
      const res = await assignGuruMapel(guruId, selectedKode);
      showMsg(res.success ? "success" : "error", res.message);
      if (res.success) {
        setSelectedKode("");
        router.refresh();
      }
    });
  }

  function handleRemove(idGuruMapel: number, namaMapel: string) {
    if (!confirm(`Hapus "${namaMapel}" dari daftar ampu ${guruNama}?`)) return;
    startTransition(async () => {
      const res = await removeGuruMapel(idGuruMapel);
      showMsg(res.success ? "success" : "error", res.message);
      if (res.success) router.refresh();
    });
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-[#1B5E20] border-2 border-[#1B5E20] px-4 py-2 rounded-lg hover:bg-[#1B5E20] hover:text-white transition-all duration-200"
      >
        <BookOpen className="w-4 h-4" />
        Kelola Mata Pelajaran Ampu
        {guruMapel.length > 0 && (
          <span className="bg-[#1B5E20] text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-[#1B5E20] transition-colors">
            {guruMapel.length}
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm">Mata Pelajaran Ampu</h2>
                    <p className="text-green-200 text-xs mt-0.5">{guruNama}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Feedback message */}
              {message && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {message.type === "success"
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {message.text}
                </div>
              )}

              {/* Tambah mapel */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Tambah Mata Pelajaran
                </p>

                {/* Search filter */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mata pelajaran..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedKode}
                    onChange={(e) => setSelectedKode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {availableMapel.length === 0 && (
                      <option disabled>
                        {allMapel.length === assignedCodes.size ? "Semua mapel sudah di-assign" : "Tidak ditemukan"}
                      </option>
                    )}
                    {availableMapel.map((mp) => (
                      <option key={mp.kodeMapel} value={mp.kodeMapel}>
                        [{mp.kodeMapel}] {mp.namaMapel}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={!selectedKode || isPending}
                    className="flex items-center gap-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {isPending
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Plus className="w-4 h-4" />}
                    Tambah
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Daftar mapel yang sudah di-assign */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Daftar Ampu ({guruMapel.length} mata pelajaran)
                </p>

                {guruMapel.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Belum ada mata pelajaran yang di-assign</p>
                    <p className="text-xs text-gray-300 mt-1">Tambahkan mata pelajaran di atas</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {guruMapel.map((gm) => (
                      <li
                        key={gm.idGuruMapel}
                        className="flex items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 group hover:border-green-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-[#1B5E20] rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{gm.mataPelajaran.namaMapel}</p>
                            <p className="text-xs text-gray-400 font-mono">{gm.kodeMapel}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(gm.idGuruMapel, gm.mataPelajaran.namaMapel)}
                          disabled={isPending}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Hapus dari daftar ampu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
