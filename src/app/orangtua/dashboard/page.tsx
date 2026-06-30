import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth.action";

export default async function OrangTuaDashboard() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-green-900">Dashboard Orang Tua</h1>
              <p className="text-sm text-gray-500 mt-1">Selamat datang, {session?.user?.name}</p>
            </div>
            <form action={logoutAction}>
              <button className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
                Keluar
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {["Absensi Anak", "Nilai Anak", "Hafalan & Tahsin"].map((menu) => (
              <div key={menu} className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-green-800">{menu}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}