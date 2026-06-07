export default function FrontendLoading() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101115]">
      <div className="h-20 border-b bg-[#101115]" />
      <section className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
        <div className="min-h-[220px] animate-pulse rounded-2xl bg-[#d9e2ec]" />
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="h-4 w-20 animate-pulse rounded bg-[#c7d2df]" />
        <div className="mt-5 h-12 max-w-2xl animate-pulse rounded bg-[#d9e2ec]" />
        <div className="mt-4 h-12 max-w-xl animate-pulse rounded bg-[#d9e2ec]" />
      </section>
    </main>
  );
}
