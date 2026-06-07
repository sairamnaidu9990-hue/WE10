export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#101115] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-8 w-56 animate-pulse rounded-xl bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-[#202126] p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="mt-5 h-7 w-36 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
