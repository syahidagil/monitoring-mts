import { getAllKelas, getAllTahunAjaran, getTahunAjaranAktif } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import KelasPageClient from "@/components/admin/kelas/KelasPageClient";

type Props = { searchParams: Promise<{ search?: string; tahunAjaranId?: string; tingkat?: string }> };

export default async function DataKelasPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const tahunAjaranId = params.tahunAjaranId ? Number(params.tahunAjaranId) : undefined;
  const tingkat = params.tingkat ? Number(params.tingkat) : undefined;

  const [allKelas, tahunAjaran, guru, tahunAktif] = await Promise.all([
    getAllKelas(),
    getAllTahunAjaran(),
    getAllGuru(),
    getTahunAjaranAktif(),
  ]);

  let data = allKelas;
  if (search) data = data.filter((k) => k.nama.toLowerCase().includes(search.toLowerCase()));
  if (tahunAjaranId) data = data.filter((k) => k.tahunAjaranId === tahunAjaranId);
  if (tingkat) data = data.filter((k) => k.tingkat === tingkat);

  return (
    <KelasPageClient
      data={data}
      tahunAjaran={tahunAjaran}
      guru={guru}
      defaultTahunAjaranId={tahunAktif?.id}
    />
  );
}