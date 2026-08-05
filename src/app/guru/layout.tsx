import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GuruNavbar from "@/components/guru/GuruNavbar";
import { getTahunPelajaranAktif } from "@/actions/tahunAjaran.action";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "GURU") redirect("/login");
  const tahunAktif = await getTahunPelajaranAktif();
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <GuruNavbar
        user={session.user}
        semesterAktif={tahunAktif ? `${tahunAktif.semester === "GANJIL" ? "Ganjil" : "Genap"} ${tahunAktif.nama}` : "Belum diatur"}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}