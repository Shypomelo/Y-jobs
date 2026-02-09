"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReport, JournalItem } from "../../providers";

export default function ResolvedJournalPage() {
    const { journalResolvedItems, reopenJournalItem, deleteJournalItem } = useReport();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filterRegion, setFilterRegion] = useState("全區");
    const [selectedItem, setSelectedItem] = useState<JournalItem | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleReturnCase = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (processingId === id) return;

        setProcessingId(id);

        setTimeout(() => {
            reopenJournalItem(id);
            setProcessingId(null);
        }, 50);
    };

    const handleDeleteCase = (id: string) => {
        deleteJournalItem(id);
        setIsDeleteConfirmOpen(false);
        setSelectedItem(null);
    };

    const getRegionFromSiteName = (siteName: string): string => {
        const prefix = siteName.substring(0, 4);
        const north = ["新竹", "基隆", "台北", "新北", "桃園", "宜蘭"];
        const central = ["苗栗", "台中", "彰化", "南投"];
        const south = ["雲林", "嘉義", "台南", "高雄", "屏東", "花蓮", "台東"];

        for (const city of north) if (prefix.includes(city)) return "北區";
        for (const city of central) if (prefix.includes(city)) return "中區";
        for (const city of south) if (prefix.includes(city)) return "南區";

        return "南區";
    };

    const regionOptions = ["全區", "北區", "中區", "南區"];
    const filteredItems = journalResolvedItems.filter(item => {
        if (filterRegion === "全區") return true;
        const region = getRegionFromSiteName(item.siteName);
        return region === filterRegion;
    });

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80"
                    >
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <span className="material-symbols-outlined text-lg">grid_view</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                            YJOB
                        </span>
                    </Link>
                    <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-700 mx-1"></div>
                    <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        已修復案場
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        返回
                    </button>
                    <div className="w-[124px]"></div>
                </div>
            </header>

            <main className="w-full max-w-[1700px] mx-auto p-4 md:p-6">
                {/* Region Filter Tabs */}
                <div className="flex gap-1 mb-0 relative z-20">
                    {regionOptions.map(region => (
                        <button
                            key={region}
                            onClick={() => setFilterRegion(region)}
                            className={`px-6 py-2 text-sm font-medium rounded-t-xl border-t border-l border-r transition-all ${filterRegion === region
                                ? "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-primary translate-y-[1px] z-30"
                                : "bg-stone-100/50 dark:bg-stone-800/50 border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400"
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-xl rounded-tl-none border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden z-10 relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap opacity-75 grayscale-[0.3]">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[110px]">狀態</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[120px]">案場名稱</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[100px]">來源</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 min-w-[200px] max-w-[300px]">問題描述</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[120px]">備註</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[80px]">天數</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[110px]">完成日期</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[110px]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                            尚無{filterRegion !== "全區" ? filterRegion : ""}已修復案場
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-stone-800 dark:text-stone-200 font-medium">{item.siteName}</td>
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{item.source}</td>
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400 truncate max-w-[200px]" title={item.description}>
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                                                <span className="truncate block max-w-[120px]" title={item.remark}>
                                                    {item.remark || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                {(function () {
                                                    if (!item.createdDateISO) return 0;
                                                    const start = new Date(item.createdDateISO);
                                                    const now = new Date();
                                                    const diffTime = Math.abs(now.getTime() - start.getTime());
                                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                    return Math.max(0, diffDays);
                                                })()}天
                                            </td>
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400 font-mono text-xs">
                                                {item.completedAt || "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded transition-colors border border-primary/20"
                                                    >
                                                        詳細資料
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleReturnCase(e, item.id)}
                                                        disabled={processingId === item.id}
                                                        className={`p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${processingId === item.id ? "opacity-50 cursor-not-allowed" : "text-stone-400 hover:text-orange-500"}`}
                                                        title="退回維運總表"
                                                    >
                                                        <span className={`material-symbols-outlined text-[20px] ${processingId === item.id ? "animate-spin" : ""}`}>
                                                            {processingId === item.id ? "refresh" : "reply"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/30">
                            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span>
                                案場詳細資料
                            </h3>
                            <button onClick={() => setSelectedItem(null)} className="size-8 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">案場名稱</label>
                                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{selectedItem.siteName}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">狀態</label>
                                    <div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                            {selectedItem.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">來源</label>
                                    <div className="text-sm text-stone-700 dark:text-stone-300">{selectedItem.source}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">待修類別</label>
                                    <div className="text-sm text-stone-700 dark:text-stone-300">{selectedItem.repairCategory || "-"}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">完成日期</label>
                                    <div className="text-sm text-stone-700 dark:text-stone-300">{selectedItem.completedAt}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">天數</label>
                                    <div className="text-sm text-stone-700 dark:text-stone-300">
                                        {(function () {
                                            if (!selectedItem.createdDateISO) return 0;
                                            const start = new Date(selectedItem.createdDateISO);
                                            const now = new Date();
                                            const diffTime = Math.abs(now.getTime() - start.getTime());
                                            return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                                        })()} 天
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">問題描述</label>
                                <div className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-100 dark:border-stone-800 whitespace-pre-wrap">{selectedItem.description}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">處理狀況</label>
                                <div className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-100 dark:border-stone-800 whitespace-pre-wrap">{selectedItem.processStatus || "(尚無內容)"}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">備註</label>
                                <div className="text-sm text-stone-700 dark:text-stone-300">{selectedItem.remark || "-"}</div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex justify-between items-center">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                className="px-4 py-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                刪除案場
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => {
                                        handleReturnCase(e, selectedItem.id);
                                        setSelectedItem(null);
                                    }}
                                    disabled={processingId === selectedItem.id}
                                    className="px-4 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${processingId === selectedItem.id ? "animate-spin" : ""}`}>
                                        {processingId === selectedItem.id ? "refresh" : "reply"}
                                    </span>
                                    退回維運總表
                                </button>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium"
                                >
                                    關閉
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="size-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">確定刪除？</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">此動作無法復原，該案場將從列表中永久移除。</p>
                        </div>
                        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 flex gap-3">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="flex-1 px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleDeleteCase(selectedItem.id)}
                                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-bold"
                            >
                                確定刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
