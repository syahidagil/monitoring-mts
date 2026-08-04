import { getAllTahunPelajaran } from "@/actions/tahunAjaran.action";
import TahunPelajaranPageClient from "@/components/admin/tahun-pelajaran/TahunPelajaranPageClient";

export default async function TahunPelajaranPage() {
  const data = await getAllTahunPelajaran();
  return <TahunPelajaranPageClient data={data} />;
}