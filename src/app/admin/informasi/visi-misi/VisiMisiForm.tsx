"use client";
import { useState, useTransition } from "react";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, Plus, Trash2 } from "lucide-react";

export default function VisiMisiForm({ visi, misi, tujuan }: { visi: any; misi: any; tujuan: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [visiText, setVisiText] = useState(visi?.isi ?? "");
  const [misiList, setMisiList] = useState<string[]>(misi?.isi ? misi.isi.split("|") : [""]);
  const [tujuanList, setTujuanList] = useState<string[]>(tujuan?.isi ? tujuan.isi.split("|") : [""]);

  async function handleSave(kategori: string, judul: string, isi: string, idInfo?: number) {
    const fd = new FormData();
    fd.append("kategori", kategori);
    fd.append("judul", judul);
    fd.append("isi", isi);
    if (idInfo) fd.append("idInfo", String(idInfo));
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  const addItem = (list: string[], setList: (v: string[]) => void) => setList([...list, ""]);
  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx));
  const updateItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setList(next);
  };

  return (
    <div className="space-y-5">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">Visi Sekolah</h2>
        <textarea
          value={visiText}
          onChange={(e) => setVisiText(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Tuliskan visi sekolah..."
        />
        <div className="flex justify-end">
          <button onClick={() => handleSave("visi", "Visi Sekolah", visiText, visi?.idInfo)}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Simpan Visi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Misi Sekolah</h2>
          <button onClick={() => addItem(misiList, setMisiList)}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Tambah Poin
          </button>
        </div>
        <div className="space-y-2">
          {misiList.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2.5">{i + 1}</div>
              <input
                value={item}
                onChange={(e) => updateItem(misiList, setMisiList, i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Poin misi ke-${i + 1}`}
              />
              {misiList.length > 1 && (
                <button onClick={() => removeItem(misiList, setMisiList, i)}
                  className="mt-2.5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => handleSave("misi", "Misi Sekolah", misiList.filter(Boolean).join("|"), misi?.idInfo)}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Simpan Misi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Tujuan Sekolah</h2>
          <button onClick={() => addItem(tujuanList, setTujuanList)}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Tambah Poin
          </button>
        </div>
        <div className="space-y-2">
          {tujuanList.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2.5">{i + 1}</div>
              <input
                value={item}
                onChange={(e) => updateItem(tujuanList, setTujuanList, i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Poin tujuan ke-${i + 1}`}
              />
              {tujuanList.length > 1 && (
                <button onClick={() => removeItem(tujuanList, setTujuanList, i)}
                  className="mt-2.5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => handleSave("tujuan", "Tujuan Sekolah", tujuanList.filter(Boolean).join("|"), tujuan?.idInfo)}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <Save className="w-4 h-4" /> Simpan Tujuan
          </button>
        </div>
      </div>
    </div>
  );
}
