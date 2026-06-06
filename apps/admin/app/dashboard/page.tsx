export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#101115] p-6 text-white md:p-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
          </div>
          <a
            className="w-max rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
            href="/"
          >
            Keluar
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Status Backend", "Online"],
            ["Database", "MongoDB Connected"],
            ["Akses", "Admin"],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-[#202126] p-5">
              <p className="text-sm text-[#a1a8b3]">{label}</p>
              <p className="mt-3 text-xl font-bold">{value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
