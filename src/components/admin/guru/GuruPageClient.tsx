"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import GuruFilter from "./GuruFilter";
import GuruTable from "./GuruTable";
import GuruForm from "./GuruForm";
import FormModal from "@/components/admin/shared/FormModal";

type Mapel = { kodeMapel: string; namaMapel: string };
type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

export default function GuruPageClient({ data, allMapel }: { data: any[]; allMapel: Mapel[] }) {
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
          <h1 className="text-xl font-bold text-gray-900">Data Guru</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} guru terdaftar</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      <GuruFilter />
      <GuruTable data={data} allMapel={allMapel} onEdit={(item) => setModal({ mode: "edit", item })} />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Data Guru" : "Tambah Guru"}
        description={modal?.mode === "edit" ? `Perbarui data: ${modal.item.user.name}` : "Tambah data guru baru ke sistem monitoring"}
        maxWidth="max-w-4xl"
      >
        {modal && (
          <GuruForm
            key={modal.mode === "edit" ? modal.item.id : "create"}
            defaultValues={modal.mode === "edit" ? { ...modal.item, ...modal.item.user } : undefined}
            isEdit={modal.mode === "edit"}
            guruId={modal.mode === "edit" ? modal.item.id : undefined}
            allMapel={allMapel}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
