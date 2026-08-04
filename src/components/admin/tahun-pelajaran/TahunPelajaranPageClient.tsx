"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import TahunPelajaranTable from "./TahunPelajaranTable";
import TahunPelajaranForm from "./TahunPelajaranForm";
import FormModal from "@/components/admin/shared/FormModal";

type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

export default function TahunPelajaranPageClient({ data }: { data: any[] }) {
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
          <h1 className="text-xl font-bold text-gray-900">Tahun Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">{data.length} tahun ajaran terdaftar</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
        </button>
      </div>

      <TahunPelajaranTable data={data} onEdit={(item) => setModal({ mode: "edit", item })} />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Tahun Pelajaran" : "Tambah Tahun Pelajaran"}
        description={modal?.mode === "edit" ? `${modal.item.nama} — Semester ${modal.item.semester}` : "Lengkapi detail untuk menambahkan rentang tahun akademik baru."}
      >
        {modal && (
          <TahunPelajaranForm
            key={modal.mode === "edit" ? modal.item.id : "create"}
            defaultValues={modal.mode === "edit" ? modal.item : undefined}
            isEdit={modal.mode === "edit"}
            taId={modal.mode === "edit" ? modal.item.id : undefined}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
