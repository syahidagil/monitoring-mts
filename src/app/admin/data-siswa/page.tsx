import { getAllSiswa } from "@/actions/siswa.action";
import { getAllKelas, getAllTahunAjaran } from "@/actions/kelas.action";
import { getAllOrangTua } from "@/actions/orangtua.action";
import SiswaPageClient from "@/components/admin/siswa/SiswaPageClient";

type Props = { searchParams: Promise<{ search?: string; kelasId?: string; statusTahfidz?: string; page?: string }> };

export default async function DataSiswaPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const statusTahfidz = params.statusTahfidz === "true" ? true : params.statusTahfidz === "false" ? false : undefined;
  const page = params.page ? Number(params.page) : 1;

  const [result, kelasList, orangtua, tahunAjaran] = await Promise.all([
    getAllSiswa({ search, kelasId, statusTahfidz, page, limit: 10 }),
    getAllKelas(),
    getAllOrangTua(),
    getAllTahunAjaran(),
  ]);

  return (
    <SiswaPageClient
      data={result.data}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      kelasList={kelasList}
      orangtua={orangtua}
      tahunAjaran={tahunAjaran}
    />
  );
}