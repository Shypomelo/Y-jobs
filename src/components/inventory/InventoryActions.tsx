"use client";

import { useState } from "react";
import { HistorySnapshot, InventoryItem } from "@/components/inventory/types";

type Props = {
    onToggleEditMode: (isEdit: boolean) => void;
    isEditMode: boolean;
    onArchive: (month: string) => void;
    inventoryHistory: HistorySnapshot[];
    currentMonth: string; // YYYY-MM
};

export default function InventoryActions({
    onToggleEditMode,
    isEditMode,
    onArchive,
    inventoryHistory,
    currentMonth
}: Props) {
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string | null>(null);

    // Archive Modal State
    const [archiveMonth, setArchiveMonth] = useState(currentMonth);

    // Initial Value / Edit Mode Handler
    const handleInitialClick = () => {
        // Toggle Edit Mode
        onToggleEditMode(!isEditMode);
    };

    const handleArchiveSubmit = () => {
        // Check for existing snapshot in history
        const exists = inventoryHistory.some(h => h.month === archiveMonth);
        if (exists) {
            const confirm = window.confirm(`月份 ${archiveMonth} 已存在歷史紀錄中。\n是否要覆蓋該月份快照？\n\n(覆蓋將以目前數值為準)`);
            if (!confirm) return;
        }

        onArchive(archiveMonth);
        setShowArchiveModal(false);
    };

    return (
        <>
            {/* Footer Action Bar */}
            <div className="mt-4 p-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-4 items-center justify-end bg-stone-50 dark:bg-stone-900/50 rounded-lg">
                <button
                    onClick={handleInitialClick}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 ${isEditMode
                        ? "bg-green-600 text-white hover:bg-green-700 border border-green-700"
                        : "text-stone-600 bg-white border border-stone-300 hover:bg-stone-50 hover:text-stone-800 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-700"
                        }`}
                >
                    {isEditMode ? (
                        <>
                            <span className="material-symbols-outlined text-lg">check</span>
                            完成設定
                        </>
                    ) : (
                        "初始值設定"
                    )}
                </button>
                <button
                    onClick={() => setShowArchiveModal(true)}
                    className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/30"
                >
                    封存
                </button>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors shadow-sm dark:bg-primary/20 dark:text-primary-light"
                >
                    歷史紀錄
                </button>
            </div>

            {/* Archive Modal */}
            {showArchiveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">庫存封存</h3>
                            <p className="text-sm text-stone-500 mb-6 dark:text-stone-400">
                                確定要封存目前庫存狀態嗎？
                                <br />
                                封存後將生成快照並保留歷史紀錄。
                            </p>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    封存月份
                                    <input
                                        type="month"
                                        value={archiveMonth}
                                        onChange={(e) => setArchiveMonth(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50 dark:bg-stone-800 dark:border-stone-700"
                                    />
                                </label>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowArchiveModal(false)}
                                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors dark:text-stone-400 dark:hover:bg-stone-800"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleArchiveSubmit}
                                    className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors shadow-sm font-bold"
                                >
                                    確定封存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">歷史紀錄 (近3個月)</h3>
                            <button
                                onClick={() => {
                                    setShowHistoryModal(false);
                                    setSelectedHistoryMonth(null);
                                }}
                                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-stone-500">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Month List */}
                            <div className="w-full md:w-64 border-r border-stone-200 dark:border-stone-800 overflow-y-auto bg-stone-50 dark:bg-stone-900/50">
                                {inventoryHistory.length === 0 ? (
                                    <div className="p-8 text-center text-stone-400 text-sm">
                                        尚無歷史紀錄
                                    </div>
                                ) : (
                                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {inventoryHistory.map((snap) => (
                                            <button
                                                key={snap.sealedAt}
                                                onClick={() => setSelectedHistoryMonth(snap.month)}
                                                className={`w-full text-left p-4 hover:bg-white dark:hover:bg-stone-800 transition-colors ${selectedHistoryMonth === snap.month ? "bg-white dark:bg-stone-800 border-l-4 border-primary" : ""
                                                    }`}
                                            >
                                                <div className="font-bold text-stone-800 dark:text-stone-200">{snap.month}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Snapshot Detail */}
                            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-stone-900">
                                {selectedHistoryMonth ? (
                                    (() => {
                                        const snap = inventoryHistory.find(h => h.month === selectedHistoryMonth);
                                        if (!snap) return null;
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <h4 className="font-bold text-stone-700 dark:text-stone-300 text-lg">{snap.month} 快照</h4>
                                                    <span className="text-xs text-stone-400">封存時間: {snap.sealedAt}</span>
                                                </div>
                                                <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500">
                                                            <tr>
                                                                <th className="px-4 py-2">型號</th>
                                                                <th className="px-4 py-2 text-right">庫存量</th>
                                                                <th className="px-4 py-2 text-right">本月入庫</th>
                                                                <th className="px-4 py-2 text-right">本月使用</th>
                                                                <th className="px-4 py-2 text-right">本月餘料</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                                            {snap.items.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="px-4 py-2 font-medium">{item.model}</td>
                                                                    <td className="px-4 py-2 text-right text-stone-600">{item.stock}</td>
                                                                    <td className="px-4 py-2 text-right text-stone-600">{item.inMonth}</td>
                                                                    <td className="px-4 py-2 text-right text-amber-600">{item.usedMonth}</td>
                                                                    <td className="px-4 py-2 text-right text-green-600 font-bold">{item.leftMonth}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="h-full flex items-center justify-center text-stone-400">
                                        請選擇左側月份查看明細
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
