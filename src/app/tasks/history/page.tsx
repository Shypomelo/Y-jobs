"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReport, Report } from "../../providers";

export default function HistoryPage() {
    const { historyReports, updateHistoryResult } = useReport();
    const router = useRouter();
    const [editingReport, setEditingReport] = useState<Report | null>(null);

    const handleEditResult = (result: "成立" | "未達標準" | "無異常") => {
        if (editingReport) {
            updateHistoryResult(editingReport.id, result);
            setEditingReport(null);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20">
            {/* 1. Header */}
            <header className="w-full p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/tasks"
                        className="flex items-center justify-center size-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-stone-400">history</span>
                        歷史紀錄
                    </h1>
                </div>
                <Link
                    href="/tasks/pending"
                    className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">pending_actions</span>
                    審核中
                </Link>
            </header>

            {/* 2. Main Content */}
            <main className="w-full max-w-[1400px] mx-auto px-6">
                <div className="bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-nowrap">
                            <thead>
                                <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">結果</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">案場名稱</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">提報人</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">來源</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300 max-w-[200px]">問題描述</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">建立時間</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">審核時間</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">附件(照片)</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-700 dark:text-stone-300">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {historyReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                            尚無歷史紀錄
                                        </td>
                                    </tr>
                                ) : (
                                    historyReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${report.reviewResult === "成立"
                                                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                        : report.reviewResult === "未達標準"
                                                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                                                        }`}
                                                >
                                                    {report.reviewResult}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-stone-800 dark:text-stone-200">
                                                {report.site}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-300">
                                                {report.reporter || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-300">
                                                {report.sourcePlatform}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-300 max-w-[200px] truncate" title={report.description}>
                                                {report.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400 font-mono text-xs">
                                                {report.createdAt}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400 font-mono text-xs">
                                                {report.reviewedAt}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-300">
                                                {report.attachment ? (
                                                    <span className="flex items-center gap-1" title={report.attachment}>
                                                        <span className="material-symbols-outlined text-lg">image</span>
                                                        <span className="truncate max-w-[100px]">{report.attachment}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setEditingReport(report)}
                                                    className="px-3 py-1.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-medium transition-colors"
                                                >
                                                    修改結果
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Result Modal */}
            {editingReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-100 dark:border-stone-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6 text-center">
                                修改審核結果
                            </h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleEditResult("成立")}
                                    className="w-full py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors font-medium text-lg"
                                >
                                    成立
                                </button>
                                <button
                                    onClick={() => handleEditResult("未達標準")}
                                    className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors font-medium text-lg"
                                >
                                    未達標準
                                </button>
                                <button
                                    onClick={() => handleEditResult("無異常")}
                                    className="w-full py-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 transition-colors font-medium text-lg"
                                >
                                    無異常
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => setEditingReport(null)}
                                className="w-full py-2.5 rounded-lg text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors font-medium"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
