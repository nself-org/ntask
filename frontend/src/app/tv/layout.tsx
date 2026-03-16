import { ReactNode } from 'react';

export default function TVLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="tv-layout bg-[#0F0F1A] min-h-screen text-white"
      data-platform="tv"
    >
      <TVStatusBar />
      <main className="tv-main">{children}</main>
    </div>
  );
}

function TVStatusBar() {
  return (
    <div className="flex items-center justify-between px-12 py-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-indigo-400">ɳ</span>
        <span className="text-2xl font-semibold">Tasks</span>
      </div>
      <div className="text-sm text-white/50" id="tv-clock" />
    </div>
  );
}
