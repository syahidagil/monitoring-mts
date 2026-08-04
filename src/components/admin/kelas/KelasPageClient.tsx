"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import KelasFilter from "./KelasFilter";
import KelasTable from "./KelasTable";
import KelasForm from "./KelasForm";
import FormModal from "@/components/admin/shared/FormModal";

type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

type Props = {
  data: any[];
  tahunAjaran: any[];
  guru: any[];
  defaultTahunAjaranId?: number;
};

export default function KelasPageClient({ data, tahunAjaran, guru, defaultTahunAjaranId }: Props) {
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
          <h1 className="text-xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Total {data.length} kelas terdaftar</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      <KelasFilter tahunAjaran={tahunAjaran} />
      <KelasTable data={data} onEdit={(item) => setModal({ mode: "edit", item })} />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Data Kelas" : "Tambah Kelas"}
        description={modal?.mode === "edit" ? `Perbarui data kelas ${modal.item.nama}` : "Manajemen Data Kelas"}
      >
        {modal && (
          <KelasForm
            key={modal.mode === "edit" ? modal.item.id : "create"}
            tahunAjaran={tahunAjaran}
            guru={guru}
            defaultValues={modal.mode === "edit" ? modal.item : undefined}
            isEdit={modal.mode === "edit"}
            kelasId={modal.mode === "edit" ? modal.item.id : undefined}
            defaultTahunAjaranId={defaultTahunAjaranId}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
