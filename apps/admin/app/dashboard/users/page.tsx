"use client";

import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import AdminShell from "../../components/AdminShell";

type User = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  isSuspended: boolean;
  createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function request(path: string, options?: RequestInit) {
    const response = await fetch(`${apiUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request gagal.");
    return data;
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await request("/api/admin/members");
      setUsers(data.users);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat user.");
    } finally {
      setLoading(false);
    }
  }

  function updateLocal(id: string, field: keyof User, value: string) {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, [field]: value } : user)),
    );
  }

  async function saveUser(user: User) {
    try {
      const data = await request(`/api/admin/members/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          username: user.username,
          name: user.name,
          phone: user.phone,
          email: user.email,
        }),
      });
      setUsers((current) => current.map((item) => (item.id === user.id ? data.user : item)));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan user.");
    }
  }

  async function updatePassword(id: string) {
    try {
      const data = await request(`/api/admin/members/${id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: passwords[id] || "" }),
      });
      setPasswords((current) => ({ ...current, [id]: "" }));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah password.");
    }
  }

  async function updateStatus(id: string, isSuspended: boolean) {
    try {
      const data = await request(`/api/admin/members/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended }),
      });
      setUsers((current) => current.map((item) => (item.id === id ? data.user : item)));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah status.");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <AdminShell>
      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
          <h1 className="mt-2 text-3xl font-bold">User Management</h1>
          <p className="mt-2 text-sm text-[#a1a8b3]">
            Edit data user, suspend user, dan ganti password.
          </p>
        </div>
        <p className="mb-4 min-h-6 text-sm text-[#a1d99b]">{message}</p>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202126]">
          {loading ? (
            <p className="p-5 text-sm text-[#a1a8b3]">Memuat user...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-white/10 text-[#a1a8b3]">
                  <tr>
                    <th className="px-4 py-4">Username</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">No hp</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Password</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id}>
                      {(["username", "name", "phone", "email"] as Array<keyof User>).map((field) => (
                        <td key={field} className="px-4 py-4">
                          <input
                            value={String(user[field])}
                            onChange={(event) => updateLocal(user.id, field, event.target.value)}
                            className="h-10 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-3 outline-none"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <input
                            value={passwords[user.id] || ""}
                            onChange={(event) =>
                              setPasswords((current) => ({ ...current, [user.id]: event.target.value }))
                            }
                            className="h-10 w-36 rounded-xl border border-white/10 bg-[#2a2b31] px-3 outline-none"
                            placeholder="Password baru"
                            type="password"
                          />
                          <button
                            type="button"
                            onClick={() => updatePassword(user.id)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black"
                          >
                            <KeyRound size={17} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={user.isSuspended ? "text-[#ff9c90]" : "text-[#9be7b4]"}>
                          {user.isSuspended ? "Suspended" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveUser(user)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black"
                            title="Simpan"
                          >
                            <Save size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(user.id, !user.isSuspended)}
                            className="rounded-xl border border-white/10 px-3 py-2 font-semibold"
                          >
                            {user.isSuspended ? "Aktifkan" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
