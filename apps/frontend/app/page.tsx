import Header from "./components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101115]">
      <Header />

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-[#0e7490]">WEB10</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Platform WEB10 siap dikembangkan.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5d6673]">
            Header frontend ini membaca pengaturan brand dari backend sehingga nama,
            logo, domain, favicon, dan warna bisa diubah dari admin.
          </p>
        </div>
      </section>
    </main>
  );
}
