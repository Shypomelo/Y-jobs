import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center items-center p-6">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Right Gradient */}
        <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
        {/* Bottom Left Gradient */}
        <div className="absolute -bottom-[10%] -left-[5%] w-[35vw] h-[35vw] bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
      </div>

      {/* Brand Identifier (Top Left) */}
      <header className="absolute top-0 left-0 w-full p-8 md:p-12 z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white group-hover:text-primary transition-colors">
            YJOB
          </h1>
        </div>
      </header>

      {/* Centered Interaction Grid */}
      <main className="relative z-10 w-full max-w-[640px] flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Button 1: Maintenance Report */}
          <Link
            href="/tasks"
            className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <div className="ml-5 flex flex-col">
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                維運通報
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tracking-wide mt-0.5 group-hover:text-primary/70 transition-colors">
                Maintenance Report
              </span>
            </div>
            <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>

          {/* Button 2: Maintenance Journal */}
          <Link
            href="/journal"
            className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[24px]">dashboard</span>
            </div>
            <div className="ml-5 flex flex-col">
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                維運總表
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tracking-wide mt-0.5 group-hover:text-primary/70 transition-colors">
                Maintenance Journal
              </span>
            </div>
            <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>

          {/* Button 3: Repair Records */}
          <Link
            href="/records"
            className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[24px]">build</span>
            </div>
            <div className="ml-5 flex flex-col">
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                維修紀錄
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tracking-wide mt-0.5 group-hover:text-primary/70 transition-colors">
                Repair Log
              </span>
            </div>
            <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>

          {/* Button 4: Inventory System */}
          <Link
            href="/inventory"
            className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
            <div className="ml-5 flex flex-col">
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                庫存系統
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tracking-wide mt-0.5 group-hover:text-primary/70 transition-colors">
                Inventory
              </span>
            </div>
            <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>

          {/* Button 5: Site History (Full Width) */}
          <Link
            href="/site-history"
            className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out md:col-span-2"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
              <span className="material-symbols-outlined text-[24px]">history_edu</span>
            </div>
            <div className="ml-5 flex flex-col">
              <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                案場履歷
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium tracking-wide mt-0.5 group-hover:text-primary/70 transition-colors">
                Site History
              </span>
            </div>
            <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
        <p className="text-[10px] text-stone-400 dark:text-stone-600 font-medium tracking-widest uppercase opacity-60">
          © 2024 YJOB System. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
