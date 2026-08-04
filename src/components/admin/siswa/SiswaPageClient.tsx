"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import SiswaFilter from "./SiswaFilter";
import SiswaTable from "./SiswaTable";
import SiswaForm from "./SiswaForm";
import FormModal from "@/components/admin/shared/FormModal";

type Modal = { mode: "create" } | { mode: "edit"; item: any } | null;

type Props = {
  data: any[];
  total: number;
  totalPages: number;
  currentPage: number;
  kelasList: any[];
  orangtua: any[];
  tahunAjaran: any[];
};

export default function SiswaPageClient({ data, total, totalPages, currentPage, kelasList, orangtua, tahunAjaran }: Props) {
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
          <h1 className="text-xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Total {total} siswa terdaftar</p>
        </div>
        <button onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Siswa
        </button>
      </div>

      <SiswaFilter kelas={kelasList} />
      <SiswaTable
        data={data}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        onEdit={(item) => setModal({ mode: "edit", item })}
      />

      <FormModal
        isOpen={!!modal}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Data Siswa" : "Tambah Siswa"}
        description={modal?.mode === "edit" ? `Perbarui data siswa: ${modal.item.nama}` : "Tambah data siswa baru ke sistem monitoring"}
        maxWidth="max-w-4xl"
      >
        {modal && (
          <SiswaForm
            key={modal.mode === "edit" ? modal.item.id : "create"}
            kelas={kelasList}
            orangtua={orangtua}
            tahunAjaran={tahunAjaran}
            defaultValues={modal.mode === "edit" ? modal.item : undefined}
            isEdit={modal.mode === "edit"}
            siswaId={modal.mode === "edit" ? modal.item.id : undefined}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        )}
      </FormModal>
    </div>
  );
}
