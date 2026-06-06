import AdminShell from "../components/AdminShell";

export default function DashboardPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
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
    </AdminShell>
  );
}
