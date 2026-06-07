"use client";

import { ArrowRight, Package } from "lucide-react";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${apiUrl}/api/products`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#d9e2ec] bg-white/70" />
          ))}
        </div>
      ) : products.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex min-h-48 flex-col justify-between rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#f8fafc]">
                  {product.logoUrl ? (
                    <img className="h-full w-full object-cover" src={product.logoUrl} alt={`${product.name} logo`} />
                  ) : (
                    <Package size={28} className="text-[#0e7490]" />
                  )}
                </div>
                <h2 className="mt-5 text-xl font-black text-[#101115]">{product.name}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5d6673]">
                  {product.shortDescription || "Detail produk tersedia di halaman berikutnya."}
                </p>
              </div>
              <span className="mt-5 flex items-center gap-2 text-sm font-black text-[#0e7490]">
                Mainkan
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white/70 p-8 text-center text-sm font-semibold text-[#5d6673]">
          Produk belum tersedia.
        </div>
      )}
    </section>
  );
}
