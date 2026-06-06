"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, Shield, Trash2 } from "lucide-react";
import AdminShell from "../../components/AdminShell";

type AdminUser = {
  id: string;
  username: string;
  role: string;
  isSuspended: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [selectedPasswords, setSelectedPasswords] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const totalActive = useMemo(
    () => admins.filter((admin) => !admin.isSuspended).length,
    [admins],
  );

  async function request(path: string, options?: RequestInit) {
    const response = await fetch(`${apiUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request gagal.");
    }

    return data;
  }

  async function loadAdmins() {
    setLoading(true);

    try {
      const data = await request("/api/admin/users");
      setAdmins(data.admins);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat admin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const data = await request("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      });

      setAdmins((current) => [data.admin, ...current]);
      setUsername("");
      setPassword("");
      setRole("admin");
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menambahkan admin.");
    }
  }

  async function updatePassword(adminId: string) {
    const nextPassword = selectedPasswords[adminId] || "";
    setMessage("");

    try {
      const data = await request(`/api/admin/users/${adminId}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: nextPassword }),
      });

      setSelectedPasswords((current) => ({ ...current, [adminId]: "" }));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah password.");
    }
  }

  async function updateRole(adminId: string, nextRole: string) {
    setMessage("");

    try {
      const data = await request(`/api/admin/users/${adminId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });

      setAdmins((current) =>
        current.map((admin) => (admin.id === adminId ? data.admin : admin)),
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah role.");
    }
  }

  async function updateStatus(adminId: string, isSuspended: boolean) {
    setMessage("");

    try {
      const data = await request(`/api/admin/users/${adminId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended }),
      });

      setAdmins((current) =>
        current.map((admin) => (admin.id === adminId ? data.admin : admin)),
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah status.");
    }
  }

  async function deleteAdmin(adminId: string) {
    setMessage("");

    try {
      const data = await request(`/api/admin/users/${adminId}`, {
        method: "DELETE",
      });

      setAdmins((current) => current.filter((admin) => admin.id !== adminId));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus admin.");
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <AdminShell>
      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Admin Management</h1>
            <p className="mt-2 text-sm text-[#a1a8b3]">
              Tambah admin, ubah password, suspend akun, hapus admin, dan atur role.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-[#202126] px-5 py-4">
              <p className="text-[#a1a8b3]">Total Admin</p>
              <p className="mt-1 text-2xl font-bold">{admins.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#202126] px-5 py-4">
              <p className="text-[#a1a8b3]">Aktif</p>
              <p className="mt-1 text-2xl font-bold">{totalActive}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreateAdmin}
          className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#202126] p-4 md:grid-cols-[1fr_1fr_180px_auto]"
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
            placeholder="Username admin"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
            placeholder="Password awal"
            type="password"
            required
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="operator">Operator</option>
          </select>
          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
          >
            <Plus size={18} />
            Tambah
          </button>
        </form>

        <p className="mb-4 min-h-6 text-sm text-[#a1d99b]" role="status">
          {message}
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202126]">
          {loading ? (
            <p className="p-5 text-sm text-[#a1a8b3]">Memuat data admin...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-white/10 text-[#a1a8b3]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Admin</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Ubah Password</th>
                    <th className="px-5 py-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black">
                            <Shield size={18} />
                          </div>
                          <div>
                            <p className="font-bold">{admin.username}</p>
                            <p className="text-xs text-[#a1a8b3]">
                              Dibuat {new Date(admin.createdAt).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={admin.role}
                          onChange={(event) => updateRole(admin.id, event.target.value)}
                          className="h-10 rounded-xl border border-white/10 bg-[#2a2b31] px-3 outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="operator">Operator</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            admin.isSuspended
                              ? "bg-[#4b1f25] text-[#ff9c90]"
                              : "bg-[#153b2c] text-[#9be7b4]"
                          }`}
                        >
                          {admin.isSuspended ? "Suspended" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <input
                            value={selectedPasswords[admin.id] || ""}
                            onChange={(event) =>
                              setSelectedPasswords((current) => ({
                                ...current,
                                [admin.id]: event.target.value,
                              }))
                            }
                            className="h-10 w-44 rounded-xl border border-white/10 bg-[#2a2b31] px-3 outline-none"
                            placeholder="Password baru"
                            type="password"
                          />
                          <button
                            type="button"
                            onClick={() => updatePassword(admin.id)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black"
                            title="Ubah password"
                          >
                            <KeyRound size={17} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(admin.id, !admin.isSuspended)}
                            className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-[#d5d8df] hover:bg-white/10"
                          >
                            {admin.isSuspended ? "Aktifkan" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAdmin(admin.id)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-[#4b1f25] text-[#ff9c90]"
                            title="Hapus admin"
                          >
                            <Trash2 size={17} />
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
