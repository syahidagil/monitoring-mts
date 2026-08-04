import { getAllOrangTua } from "@/actions/orangtua.action";
import OrangtuaPageClient from "@/components/admin/orangtua/OrangtuaPageClient";

type Props = { searchParams: Promise<{ search?: string }> };

export default async function DataOrangtuaPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search ?? "";

  let data = await getAllOrangTua();
  if (search) {
    data = data.filter((o) =>
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  return <OrangtuaPageClient data={data} />;
}