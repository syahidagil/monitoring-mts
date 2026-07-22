import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GuruNavbar from "@/components/guru/GuruNavbar";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "GURU") redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50">
      <GuruNavbar user={session.user} />
      <div className="pt-14">
        {children}
      </div>
    </div>
  );
}