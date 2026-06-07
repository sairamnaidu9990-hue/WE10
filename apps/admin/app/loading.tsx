export default function AdminLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101115] text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202126] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        <p className="mt-5 text-center text-sm font-semibold text-[#d5d8df]">Memuat admin panel...</p>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-white" />
        </div>
      </div>
    </main>
  );
}
