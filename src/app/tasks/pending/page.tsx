"use client";

import { useState } from "react";
import Link from "next/link";
import { useReport, Report } from "../../providers";

export default function PendingPage() {
    const { pendingReports, reviewPending } = useReport();
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (report: Report) => {
        setSelectedReport(report);
        setIsSubmitting(false);
    };

    const handleCloseModal = () => {
        setSelectedReport(null);
        setIsSubmitting(false);
    };

    const handleReview = (result: "成立" | "未達標準" | "無異常") => {
        if (selectedReport && !isSubmitting) {
            setIsSubmitting(true);
            reviewPending(selectedReport.id, result);
            handleCloseModal();
        }
    };

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20 relative">
            <header className="w-full p-6 md:p-8">
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
            </header>

            <main className="w-full max-w-3xl mx-auto px-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
                            審核中通報
                        </h1>
                        <div className="flex gap-2">
                            <Link
                                href="/tasks/history"
                                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">history</span>
                                歷史通報
                            </Link>
                            <Link
                                href="/tasks"
                                className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                            >
                                返回建立
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {pendingReports.length === 0 ? (
                            <div className="bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-8 text-center">
                                <div className="inline-flex items-center justify-center size-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mb-4">
                                    <span className="material-symbols-outlined text-3xl">inbox</span>
                                </div>
                                <h3 className="text-lg font-medium text-stone-800 dark:text-stone-200 mb-2">
                                    目前無審核中通報
                                </h3>
                                <p className="text-stone-500 dark:text-stone-400 mb-6">
                                    您提交的維修通報將會顯示於此列表等待審核。
                                </p>
                                <Link
                                    href="/tasks"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    立即建立通報
                                </Link>
                            </div>
                        ) : (
                            pendingReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-5 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Header: Site & Location */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                                                    {report.site}
                                                </h3>
                                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                                    {report.reporter || "-"}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${report.reviewResult === "未達標準"
                                                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700"
                                                }`}>
                                                {report.reviewResult || "審核中"}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-1">
                                            <div>
                                                <span className="text-stone-400 text-xs block mb-0.5">類別</span>
                                                <span className="text-stone-700 dark:text-stone-300 font-medium">
                                                    {report.category}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-stone-400 text-xs block mb-0.5">來源</span>
                                                <span className="text-stone-700 dark:text-stone-300 font-medium">
                                                    {report.sourcePlatform || "-"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3 text-sm text-stone-600 dark:text-stone-300">
                                            <span className="font-medium text-stone-800 dark:text-stone-200 block mb-1">
                                                問題描述
                                            </span>
                                            <span className="line-clamp-2">
                                                {report.description}
                                            </span>
                                        </div>

                                        {/* Footer: Created At + Action */}
                                        <div className="pt-3 mt-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                                            <span>{report.createdAt}</span>
                                            <button
                                                onClick={() => handleOpenModal(report)}
                                                className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 px-2 py-1 -mr-2 rounded hover:bg-primary/5 transition-colors"
                                            >
                                                查看詳細
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                                待確認通報
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Read-only Fields (Same layout as tasks page) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 1. Site Name */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">案場名稱</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.site}
                                    </div>
                                </div>
                                {/* 2. Reporter */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">提報人</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.reporter || "-"}
                                    </div>
                                </div>
                                {/* 3. Category */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">待修類別</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.category}
                                    </div>
                                </div>
                                {/* 4. Source Platform */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">異常來源平台</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.sourcePlatform || "-"}
                                    </div>
                                </div>
                                {/* 5. Address */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">案場地址</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.address || "-"}
                                    </div>
                                </div>
                                {/* 6. Contact */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-stone-500 uppercase">聯絡方式</label>
                                    <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                        {selectedReport.contact || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-stone-500 uppercase">問題描述</label>
                                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm min-h-[80px] whitespace-pre-wrap">
                                    {selectedReport.description}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-stone-500 uppercase">附件</label>
                                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm flex items-center gap-2">
                                    {selectedReport.attachment ? (
                                        <>
                                            <span className="material-symbols-outlined text-primary">attach_file</span>
                                            <span>{selectedReport.attachment}</span>
                                        </>
                                    ) : (
                                        <span className="text-stone-400">無附件</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-stone-500 uppercase">備註</label>
                                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm whitespace-pre-wrap">
                                    {selectedReport.note || "-"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-stone-500 uppercase">建立時間</label>
                                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-stone-800 dark:text-stone-200 text-sm">
                                    {selectedReport.createdAt}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 grid grid-cols-3 gap-3">
                            <button
                                disabled={isSubmitting}
                                onClick={() => handleReview("成立")}
                                className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2.5 px-4 rounded-lg border border-green-200 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                成立
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={() => handleReview("未達標準")}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2.5 px-4 rounded-lg border border-amber-200 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                未達標準
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={() => handleReview("無異常")}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-200 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                無異常
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
