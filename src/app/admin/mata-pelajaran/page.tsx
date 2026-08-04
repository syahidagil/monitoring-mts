import { getAllMapel } from "@/actions/mapel.action";
import { getTahunAjaranAktif } from "@/actions/kelas.action";
import MapelPageClient from "@/components/admin/mapel/MapelPageClient";

type Props = { searchParams: Promise<{ search?: string }> };

export default async function MataPelajaranPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";

  const [allMapel, tahunAktif] = await Promise.all([getAllMapel(), getTahunAjaranAktif()]);
  let data = allMapel;
  if (search) {
    data = data.filter((m) =>
      m.namaMapel.toLowerCase().includes(search.toLowerCase()) ||
      m.kodeMapel.toLowerCase().includes(search.toLowerCase())
    );
  }

  return <MapelPageClient data={data} tahunAktif={tahunAktif} />;
}