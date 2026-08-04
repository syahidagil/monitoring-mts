"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import JadwalTable from "./JadwalTable";
import JadwalForm from "./JadwalForm";
import FormModal from "../shared/FormModal";
import AutoSubmitForm from "@/components/shared/AutoSubmitForm";

type ModalState = { mode: "create" } | { mode: "edit"; item: any } | null;

type Props = {
  jadwal: any[];
  kelasList: any[];
  guruList: any[];
  mapelList: any[];
  tahunAjaranList: any[];
  filters: { kelasId?: string; guruId?: string; hari?: string };
};

export default function JadwalPageClient({
  jadwal, kelasList, guruList, mapelList, tahunAjaranList, filters
}: Props) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>(null);

  const handleSuccess = () => {
    setModalState(null);
    router.refresh();
  };

  const handleCancel = () => {
    setModalState(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jadwal Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">Total {jadwal.length} jadwal</p>
        </div>
        <button
          onClick={() => setModalState({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <AutoSubmitForm className="flex flex-wrap gap-3 w-full">
          <select
            name="kelasId"
            defaultValue={filters.kelasId ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>Kelas {k.nama}</option>
            ))}
          </select>
          <select
            name="guruId"
            defaultValue={filters.guruId ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Semua Guru</option>
            {guruList.map((g) => (
              <option key={g.id} value={g.id}>{g.user.name}</option>
            ))}
          </select>
          <select
            name="hari"
            defaultValue={filters.hari ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Semua Hari</option>
            {["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"].map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </AutoSubmitForm>
      </div>

      <JadwalTable
        data={jadwal}
        onEdit={(item) => setModalState({ mode: "edit", item })}
      />

      <FormModal
        isOpen={modalState !== null}
        onClose={handleCancel}
        title={modalState?.mode === "edit" ? "Edit Jadwal" : "Tambah Jadwal Baru"}
        maxWidth="max-w-3xl"
      >
        <JadwalForm
          kelas={kelasList}
          guru={guruList}
          mapel={mapelList}
          tahunAjaran={tahunAjaranList}
          defaultValues={modalState?.mode === "edit" ? modalState.item : undefined}
          isEdit={modalState?.mode === "edit"}
          jadwalId={modalState?.mode === "edit" ? modalState.item.id : undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </FormModal>
    </div>
  );
}
