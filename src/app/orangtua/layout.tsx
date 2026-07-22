import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrangtuaSidebar from "@/components/orangtua/OrangtuaSidebar";

export default async function OrangtuaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ORANGTUA") redirect("/login");
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OrangtuaSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto lg:ml-0">
        {children}
      </main>
    </div>
  );
}