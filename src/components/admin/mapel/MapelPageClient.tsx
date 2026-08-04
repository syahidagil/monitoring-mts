"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import MapelFilter from "./MapelFilter";
import MapelTable from "./MapelTable";
import MapelForm from "./MapelForm";
import FormModal from "@/components/admin/shared/FormModal";

type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

export default function MapelPageClient({ data, tahunAktif }: { data: any[]; tahunAktif?: any }) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);

  function close() {
    setModal(null);
  }
  function handleSuccess() {
    close();
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} mata pelajaran</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Mapel
        </button>
      </div>

      <MapelFilter />
      <MapelTable data={data} onEdit={(item) => setModal({ mode: "edit", item })} />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
        description={modal?.mode === "edit" ? `Perbarui data: ${modal.item.namaMapel}` : "Tambah mata pelajaran baru ke sistem"}
      >
        {modal && (
          <MapelForm
            key={modal.mode === "edit" ? modal.item.kodeMapel : "create"}
            defaultValues={modal.mode === "edit" ? modal.item : undefined}
            isEdit={modal.mode === "edit"}
            tahunAktif={tahunAktif}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
