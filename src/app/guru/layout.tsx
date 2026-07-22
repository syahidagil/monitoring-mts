import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GuruNavbar from "@/components/guru/GuruNavbar";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "GURU") redirect("/login");
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <GuruNavbar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}