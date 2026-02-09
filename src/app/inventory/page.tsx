import Link from "next/link";

export default function Inventory() {
    return (
        <div className="relative flex min-h-screen w-full flex-col justify-center items-center p-6">
            {/* Background Elements (Copied from Homepage for consistency) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
                <div className="absolute -bottom-[10%] -left-[5%] w-[35vw] h-[35vw] bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
            </div>

            {/* Header: Back to Home (Aligned with Homepage Logo position) */}
            <header className="absolute top-0 left-0 w-full p-8 md:p-12 z-20">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    <span className="font-semibold text-lg">回首頁</span>
                </Link>
            </header>


            <main className="relative z-10 w-full max-w-[640px] flex flex-col items-center">
                {/* Page Title */}
                <div className="w-full mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                        庫存系統
                    </h1>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Card 1: North */}
                    <Link
                        href="/inventory/north"
                        className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
                    >
                        <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                            <span className="material-symbols-outlined text-[24px]">location_on</span>
                        </div>
                        <div className="ml-5 flex flex-col">
                            <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                                北區庫存
                            </span>
                        </div>
                        <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
                            arrow_forward
                        </span>
                    </Link>

                    {/* Card 2: Central */}
                    <Link
                        href="/inventory/central"
                        className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
                    >
                        <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                            <span className="material-symbols-outlined text-[24px]">location_on</span>
                        </div>
                        <div className="ml-5 flex flex-col">
                            <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                                中區庫存
                            </span>
                        </div>
                        <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
                            arrow_forward
                        </span>
                    </Link>

                    {/* Card 3: South */}
                    <Link
                        href="/inventory/south"
                        className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
                    >
                        <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                            <span className="material-symbols-outlined text-[24px]">location_on</span>
                        </div>
                        <div className="ml-5 flex flex-col">
                            <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                                南區庫存
                            </span>
                        </div>
                        <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
                            arrow_forward
                        </span>
                    </Link>

                    {/* Card 4: Usage */}
                    <Link
                        href="/inventory/usage"
                        className="group relative flex items-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-glow transition-all duration-300 ease-out"
                    >
                        <div className="flex items-center justify-center size-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                            <span className="material-symbols-outlined text-[24px]">data_usage</span>
                        </div>
                        <div className="ml-5 flex flex-col">
                            <span className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                                使用狀況
                            </span>
                        </div>
                        <span className="material-symbols-outlined absolute right-4 text-stone-300 group-hover:text-primary/50 group-hover:translate-x-1 transition-all duration-300">
                            arrow_forward
                        </span>
                    </Link>
                </div>
            </main>

            {/* Footer (Copied from Homepage for consistency) */}
            <footer className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
                <p className="text-[10px] text-stone-400 dark:text-stone-600 font-medium tracking-widest uppercase opacity-60">
                    © 2024 YJOB System. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}
