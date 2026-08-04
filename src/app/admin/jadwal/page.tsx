import { getAllJadwal } from "@/actions/jadwal.action";
import { getAllKelas } from "@/actions/kelas.action";
import { getAllGuru } from "@/actions/guru.action";
import { getAllMapel } from "@/actions/mapel.action";
import { getAllTahunPelajaran } from "@/actions/tahunAjaran.action";
import JadwalPageClient from "@/components/admin/jadwal/JadwalPageClient";

type Props = { searchParams: Promise<{ kelasId?: string; guruId?: string; hari?: string }> };

export default async function JadwalPage({ searchParams }: Props) {
  const params = await searchParams;
  const kelasId = params.kelasId ? Number(params.kelasId) : undefined;
  const guruId = params.guruId ?? undefined;
  const hari = params.hari ?? undefined;

  const [jadwalResult, kelasList, guruList, mapelList, tahunAjaranList] = await Promise.all([
    getAllJadwal({ kelasId, guruId, hari }),
    getAllKelas(),
    getAllGuru(),
    getAllMapel(),
    getAllTahunPelajaran(),
  ]);

  // getAllJadwal mengembalikan objek hasil paginasi { data, total, ... },
  // bukan array langsung — jadi harus di-unwrap dulu sebelum dipakai.
  const jadwal = jadwalResult.data;

  return (
    <JadwalPageClient
      jadwal={jadwal}
      kelasList={kelasList}
      guruList={guruList}
      mapelList={mapelList}
      tahunAjaranList={tahunAjaranList}
      filters={{ kelasId: params.kelasId, guruId: params.guruId, hari: params.hari }}
    />
  );
}