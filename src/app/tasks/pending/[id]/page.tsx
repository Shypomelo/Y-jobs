"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useReport, Report } from "@/app/providers"; // Fixed Import Path

export default function PendingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { pendingReports, reviewPending } = useReport();
    const [report, setReport] = useState<Report | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (params.id) {
            const found = pendingReports.find((r) => r.id === params.id);
            if (found) {
                setReport(found);
            } else {
                // Not found, redirect back
                router.push("/tasks/pending");
            }
        }
    }, [params.id, pendingReports, router]);

    const handleReview = (result: "成立" | "未達標準" | "無異常", e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling
        if (isSubmitting) return; // Guard against re-entry

        if (report) {
            setIsSubmitting(true);
            try {
                reviewPending(report.id, result);
                router.push("/tasks/history");
            } catch (error) {
                console.error("Review failed:", error);
                setIsSubmitting(false); // Only reset on error, otherwise we navigate away
            }
        }
    };

    if (!report) return null; // Or loading state

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20">
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
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
                            待確認通報
                        </h1>
                        <Link
                            href="/tasks/pending"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-colors"
                        >
                            返回清單
                        </Link>
                    </div>

                    {/* Form Card (Read Only) */}
                    <div className="bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400">案場位置</label>
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                        {report.location}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400">案場名稱</label>
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                        {report.site}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400">待修類別</label>
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                        {report.category}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400">異常來源平台</label>
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                        {report.sourcePlatform || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Address & Reporter (Mixed) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400">案場地址</label>
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                        {report.address || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-stone-600 dark:text-stone-400">聯絡方式</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                    {report.contact || "-"}
                                </div>
                            </div>


                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-stone-600 dark:text-stone-400">問題描述</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100 min-h-[100px] whitespace-pre-wrap">
                                    {report.description}
                                </div>
                            </div>

                            {/* Attachments - Placeholder */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-stone-600 dark:text-stone-400">附件</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-500 italic">
                                    (未上傳檔案)
                                </div>
                            </div>

                            {/* Note */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-stone-600 dark:text-stone-400">備註</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100 whitespace-pre-wrap">
                                    {report.note || "-"}
                                </div>
                            </div>

                            {/* Created At */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-stone-600 dark:text-stone-400">建立時間</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-100">
                                    {report.createdAt}
                                </div>
                            </div>

                            {/* Review Actions */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                                <button
                                    disabled={isSubmitting}
                                    onClick={(e) => handleReview("成立", e)}
                                    className={`bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 hover:shadow-md"}`}
                                >
                                    成立
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={(e) => handleReview("未達標準", e)}
                                    className={`bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 hover:shadow-md"}`}
                                >
                                    未達標準
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={(e) => handleReview("無異常", e)}
                                    className={`bg-stone-500 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-600 hover:shadow-md"}`}
                                >
                                    無異常
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
