"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import OrangtuaFilter from "./OrangtuaFilter";
import OrangtuaTable from "./OrangtuaTable";
import OrangtuaForm from "./OrangtuaForm";
import FormModal from "@/components/admin/shared/FormModal";

type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

export default function OrangtuaPageClient({ data }: { data: any[] }) {
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
          <h1 className="text-xl font-bold text-gray-900">Data Wali Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} wali siswa terdaftar</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Wali Siswa
        </button>
      </div>

      <OrangtuaFilter />
      <OrangtuaTable data={data} onEdit={(item) => setModal({ mode: "edit", item })} />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Data Wali Siswa" : "Tambah Wali Siswa"}
        description={modal?.mode === "edit" ? `Perbarui data: ${modal.item.user.name}` : "Input data wali siswa baru"}
        maxWidth="max-w-2xl"
      >
        {modal && (
          <OrangtuaForm
            key={modal.mode === "edit" ? modal.item.id : "create"}
            defaultValues={modal.mode === "edit" ? { ...modal.item, ...modal.item.user } : undefined}
            isEdit={modal.mode === "edit"}
            ortuId={modal.mode === "edit" ? modal.item.id : undefined}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
