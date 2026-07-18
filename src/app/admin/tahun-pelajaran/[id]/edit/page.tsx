import { getTahunAjaranById } from "@/actions/tahunAjaran.action";
import { notFound } from "next/navigation";
import TahunPelajaranForm from "@/components/admin/tahun-pelajaran/TahunPelajaranForm";

export default async function EditTahunPelajaranPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ta = await getTahunAjaranById(Number(id));
  if (!ta) notFound();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Tahun Ajaran</h1>
        <p className="text-sm text-gray-500 mt-1">{ta.nama} - Semester {ta.semester}</p>
      </div>
      <TahunPelajaranForm defaultValues={ta} isEdit taId={ta.id} />
    </div>
  );
}