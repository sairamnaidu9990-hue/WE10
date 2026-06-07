"use client";

import { FormEvent, useEffect, useState } from "react";
import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import AdminShell from "../../components/AdminShell";

type Product = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    shortDescription: "",
  });

  async function loadProducts() {
    try {
      const response = await fetch(`${apiUrl}/api/admin/products`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal memuat produk.");
      setProducts(data.products);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menambahkan produk.");
      setProducts((current) => [data.product, ...current]);
      setForm({ name: "", logoUrl: "", shortDescription: "" });
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menambahkan produk.");
    }
  }

  async function saveProduct(product: Product) {
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menyimpan produk.");
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? data.product : item)),
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan produk.");
    }
  }

  async function deleteProduct(productId: string) {
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menghapus produk.");
      setProducts((current) => current.filter((product) => product.id !== productId));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus produk.");
    }
  }

  function updateProduct(productId: string, field: keyof Product, value: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product,
      ),
    );
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Produk</h1>
          <p className="mt-2 text-sm text-[#a1a8b3]">
            Atur logo, nama, dan penjelasan singkat produk yang tampil di frontend.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 rounded-2xl border border-white/10 bg-[#202126] p-5"
        >
          <h2 className="text-xl font-bold">Tambah Produk</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Nama Produk</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Nama produk"
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Logo URL</span>
              <input
                value={form.logoUrl}
                onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://.../logo.png"
              />
            </label>
          </div>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Penjelasan Singkat</span>
            <textarea
              value={form.shortDescription}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#2a2b31] p-4 outline-none focus:border-white/30"
              placeholder="Tuliskan penjelasan singkat produk"
            />
          </label>
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black md:w-fit">
            <Plus size={18} />
            Tambah Produk
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#202126] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Daftar Produk</h2>
            <p className="text-sm text-[#a1d99b]" role="status">
              {loading ? "Memuat produk..." : message}
            </p>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="grid gap-4 rounded-2xl border border-white/10 bg-[#18191e] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {product.logoUrl ? (
                      <img className="h-full w-full object-cover" src={product.logoUrl} alt="" />
                    ) : (
                      <span className="text-2xl font-black">{product.name.charAt(0) || "P"}</span>
                    )}
                  </div>

                  <div className="grid flex-1 gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={product.name}
                        onChange={(event) => updateProduct(product.id, "name", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        placeholder="Nama produk"
                      />
                      <input
                        value={product.logoUrl}
                        onChange={(event) => updateProduct(product.id, "logoUrl", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        placeholder="Logo URL"
                      />
                    </div>
                    <textarea
                      value={product.shortDescription}
                      onChange={(event) => updateProduct(product.id, "shortDescription", event.target.value)}
                      className="min-h-24 rounded-xl border border-white/10 bg-[#2a2b31] p-4 text-sm outline-none focus:border-white/30"
                      placeholder="Penjelasan singkat"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => saveProduct(product)}
                        className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black"
                      >
                        <Save size={16} />
                        Simpan
                      </button>
                      <a
                        className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-[#d5d8df]"
                        href={`${frontendUrl}/products/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={16} />
                        Lihat
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-[#ff9c90]/30 px-4 text-sm font-bold text-[#ff9c90]"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!loading && products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-[#a1a8b3]">
                Belum ada produk.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
