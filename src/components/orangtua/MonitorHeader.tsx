import ChildSwitcher from "@/components/orangtua/ChildSwitcher";

type Anak = { id: number; nama: string; kelasNama: string };

export default function MonitorHeader({
  judul, subjudul, anakList, aktifId,
}: {
  judul: string; subjudul: string;
  anakList: Anak[]; aktifId: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{judul}</h1>
        <p className="text-sm text-gray-500 mt-1">{subjudul}</p>
      </div>
      <ChildSwitcher anakList={anakList} aktifId={aktifId} />
    </div>
  );
}