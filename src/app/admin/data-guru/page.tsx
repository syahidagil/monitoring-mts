import { getAllGuru } from "@/actions/guru.action";
import { getAllMapel } from "@/actions/mapel.action";
import GuruPageClient from "@/components/admin/guru/GuruPageClient";

type Props = { searchParams: Promise<{ search?: string; status?: string }> };

export default async function DataGuruPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status;

  const [allGuru, allMapel] = await Promise.all([getAllGuru(), getAllMapel()]);
  let data = allGuru;

  if (search) {
    data = data.filter((g) =>
      g.user.name.toLowerCase().includes(search.toLowerCase()) ||
      g.user.username.toLowerCase().includes(search.toLowerCase()) ||
      (g.nip && g.nip.includes(search))
    );
  }
  if (status === "aktif") data = data.filter((g) => g.user.status);
  if (status === "nonaktif") data = data.filter((g) => !g.user.status);

  return <GuruPageClient data={data} allMapel={allMapel} />;
}