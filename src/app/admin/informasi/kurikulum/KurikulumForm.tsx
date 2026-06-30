"use client";
import { useState, useTransition } from "react";
import { upsertSchoolInfo } from "@/actions/schoolInfo";
import { Save, Plus, Trash2 } from "lucide-react";

export default function KurikulumForm({ nasional, keislaman }: { nasional: any; keislaman: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"nasional" | "keislaman">("nasional");
  const [nasionalList, setNasionalList] = useState<string[]>(nasional?.isi ? nasional.isi.split("|") : [""]);
  const [keislamanList, setKeislamanList] = useState<string[]>(keislaman?.isi ? keislaman.isi.split("|") : [""]);

  const currentList = activeTab === "nasional" ? nasionalList : keislamanList;
  const setCurrentList = activeTab === "nasional" ? setNasionalList : setKeislamanList;
  const currentData = activeTab === "nasional" ? nasional : keislaman;
  const currentJudul = activeTab === "nasional" ? "Kurikulum Nasional" : "Kurikulum Keislaman";

  async function handleSave() {
    const fd = new FormData();
    fd.append("kategori", "kurikulum");
    fd.append("judul", currentJudul);
    fd.append("isi", currentList.filter(Boolean).join("|"));
    if (currentData?.idInfo) fd.append("idInfo", String(currentData.idInfo));
    startTransition(async () => {
      const result = await upsertSchoolInfo(fd);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  const addItem = () => setCurrentList([...currentList, ""]);
  const removeItem = (i: number) => setCurrentList(currentList.filter((_, idx) => idx !== i));
  const updateItem = (i: number, val: string) => {
    const next = [...currentList];
    next[i] = val;
    setCurrentList(next);
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["nasional", "keislaman"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "nasional" ? "Kurikulum Nasional" : "Kurikulum Keislaman"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{currentJudul}</h2>
          <button onClick={addItem}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Tambah Poin
          </button>
        </div>
        <div className="space-y-2">
          {currentList.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <input value={item} onChange={(e) => updateItem(i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Mata pelajaran / program ke-${i + 1}`} />
              {currentList.length > 1 && (
                <button onClick={() => removeItem(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={isPending}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            {isPending ? "Menyimpan..." : `Simpan ${currentJudul}`}
          </button>
        </div>
      </div>
    </div>
  );
}
