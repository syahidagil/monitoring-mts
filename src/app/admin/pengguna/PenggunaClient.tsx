"use client";
import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUserStatus, resetPassword } from "@/actions/users";
import { Plus, Trash2, ToggleLeft, ToggleRight, Key, User } from "lucide-react";

const ROLES = ["ADMIN", "GURU", "ORANGTUA"] as const;
const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", GURU: "Guru", ORANGTUA: "Orang Tua" };
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  GURU: "bg-blue-100 text-blue-700",
  ORANGTUA: "bg-orange-100 text-orange-700",
};

export default function PenggunaClient({ users }: { users: any[] }) {
  const [activeTab, setActiveTab] = useState<"ADMIN" | "GURU" | "ORANGTUA">("ADMIN");
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = users.filter((u) => u.role === activeTab);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUser(fd);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
      if (result.success) { setShowModal(false); setTimeout(() => setMessage(null), 3000); }
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {ROLES.map((role) => (
            <button key={role} onClick={() => setActiveTab(role)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === role ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
              {ROLE_LABELS[role]} ({users.filter((u) => u.role === role).length})
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada pengguna {ROLE_LABELS[activeTab]}
                </td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">{user.name.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{user.username}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {user.status ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => startTransition(() => updateUserStatus(user.id, !user.status))}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                      {user.status ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button onClick={() => {
                      const pw = prompt("Password baru (min 6 karakter):");
                      if (pw) startTransition(() => resetPassword(user.id, pw).then((r) => setMessage({ type: r.success ? "success" : "error", text: r.message })));
                    }} className="text-xs text-blue-500 hover:text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors">
                      Reset PW
                    </button>
                    <button onClick={() => {
                      if (confirm("Hapus pengguna ini?")) startTransition(() => deleteUser(user.id));
                    }} className="text-xs text-red-500 hover:text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input name="username" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input name="password" type="password" required minLength={6} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Min. 6 karakter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select name="role" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
