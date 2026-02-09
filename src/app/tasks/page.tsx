"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReport } from "../providers";

const VALID_CITIES = new Set([
    "基隆", "台北", "臺北", "新北", "桃園", "新竹", "宜蘭",
    "苗栗", "台中", "臺中", "彰化", "南投",
    "雲林", "嘉義", "台南", "臺南", "高雄", "屏東", "花蓮", "台東", "臺東"
]);

const validateSiteName = (name: string): boolean => {
    if (name.length < 4) return false;
    const city = name.substring(0, 2);
    const district = name.substring(2, 4);

    if (!VALID_CITIES.has(city)) return false;

    // Check if district is Chinese characters (basic range check)
    if (!/^[\u4e00-\u9fa5]{2}$/.test(district)) return false;

    return true;
};

export default function TasksPage() {
    // Form State
    // Form State
    const initialFormState = {
        site: "",           // 1. 案場名稱
        reporter: "",       // 2. 提報人
        category: "三顆以下優化器", // 3. 待修類別 (Default to first option)
        sourcePlatform: "", // 4. 異常來源平台
        address: "",        // 5. 案場地址
        contact: "",        // 6. 聯絡方式
        description: "",
        note: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [siteNameError, setSiteNameError] = useState("");

    const router = useRouter();
    const { addPending } = useReport();

    // Handlers
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "site") {
            if (value && !validateSiteName(value)) {
                setSiteNameError("案場名稱填寫錯誤");
            } else {
                setSiteNameError("");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.site.trim() || !formData.description.trim() || !formData.reporter.trim()) {
            alert("請填寫案場名稱、提報人與問題描述");
            return;
        }

        if (siteNameError || !validateSiteName(formData.site)) {
            alert("案場名稱填寫錯誤");
            setSiteNameError("案場名稱填寫錯誤");
            return;
        }

        // Get Attachment Name
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        const attachmentName = fileInput?.files?.[0]?.name;

        // Create Report
        const report = {
            id: crypto.randomUUID(),
            ...formData,
            createdAt: new Date().toLocaleString("zh-TW", { hour12: false }),
            attachment: attachmentName,
            reviewResult: (formData.category === "三顆以下優化器" ? "未達標準" : undefined) as "未達標準" | "成立" | "無異常" | undefined,
        };

        // Add to Store
        addPending(report);

        // Clear Form (Optional, but good UX)
        setFormData(initialFormState);

        // Navigate
        router.push("/tasks/pending");
    };

    const handleReset = () => {
        setFormData(initialFormState);
        // Note: File input reset is not handled by state, but sufficient for this skeleton
    };

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20">
            {/* 1. Header: YJOB Logo */}
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

            {/* 2. Main Content */}
            <main className="w-full max-w-3xl mx-auto px-6">
                <div className="flex flex-col gap-6">
                    {/* Page Title */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">
                            維運通報
                        </h1>
                        <div className="flex gap-3">
                            <Link
                                href="/tasks/pending"
                                className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">pending_actions</span>
                                審核中
                            </Link>
                            <Link
                                href="/tasks/history"
                                className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">history</span>
                                歷史
                            </Link>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">
                                edit_document
                            </span>
                            建立通報
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Row 1: Site & Reporter (2 cols on md) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 1) 案場名稱 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="site"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        案場名稱
                                    </label>
                                    <input
                                        type="text"
                                        id="site"
                                        name="site"
                                        value={formData.site}
                                        onChange={handleChange}
                                        placeholder="請輸入案場名稱"
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        required
                                    />
                                    {siteNameError && (
                                        <p className="text-red-500 text-xs mt-1">{siteNameError}</p>
                                    )}
                                </div>

                                {/* 2) 提報人 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="reporter"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        提報人
                                    </label>
                                    <input
                                        type="text"
                                        id="reporter"
                                        name="reporter"
                                        value={formData.reporter}
                                        onChange={handleChange}
                                        placeholder="請輸入提報人姓名"
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Category & Source Platform (2 cols on md) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 3) 待修類別 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="category"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        待修類別
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="三顆以下優化器">三顆以下優化器</option>
                                            <option value="四顆以上優化器">四顆以上優化器</option>
                                            <option value="逆變器問題">逆變器問題</option>
                                            <option value="線管路問題">線管路問題</option>
                                            <option value="監控問題">監控問題</option>
                                            <option value="房屋問題">房屋問題</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xl">
                                            expand_more
                                        </span>
                                    </div>
                                </div>

                                {/* 4) 異常來源平台 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="sourcePlatform"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        異常來源平台
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="sourcePlatform"
                                            name="sourcePlatform"
                                            value={formData.sourcePlatform}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all cursor-pointer ${formData.sourcePlatform === "" ? "text-stone-400" : ""
                                                }`}
                                        >
                                            <option value="" disabled>請選擇發現異常平台</option>
                                            <option value="Solaredge">Solaredge</option>
                                            <option value="慧景">慧景</option>
                                            <option value="友達">友達</option>
                                            <option value="台達">台達</option>
                                            <option value="新旺">新旺</option>
                                            <option value="業主報修">業主報修</option>
                                            <option value="內部人員">內部人員</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xl">
                                            expand_more
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Address & Contact (2 cols on md) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 5) 案場地址 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="address"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        案場地址
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="請輸入完整地址"
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* 6) 聯絡方式 */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="contact"
                                        className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                    >
                                        聯絡方式
                                    </label>
                                    <input
                                        type="text"
                                        id="contact"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        placeholder="電話 / 姓名"
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                >
                                    問題描述
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="請詳細描述問題狀況..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y min-h-[100px]"
                                />
                            </div>

                            {/* Attachment */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="attachment"
                                    className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                >
                                    附件
                                </label>
                                <input
                                    type="file"
                                    id="attachment"
                                    name="attachment"
                                    className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                />
                            </div>

                            {/* Note */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="note"
                                    className="text-sm font-medium text-stone-600 dark:text-stone-400"
                                >
                                    備註
                                </label>
                                <textarea
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="其他補充事項（可選）"
                                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={!!siteNameError}
                                        className={`flex-1 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${siteNameError
                                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                            : "bg-primary hover:bg-primary/90 text-stone-700 hover:shadow-glow"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">send</span>
                                        送出
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-6 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-medium"
                                    >
                                        清空
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* 3. Footer Navigation (Simple) */}
            <div className="w-full max-w-3xl mx-auto px-6 mt-12 mb-6">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 text-stone-500 hover:text-primary transition-colors py-4 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/50"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-medium">返回首頁</span>
                </Link>
            </div>
        </div>
    );
}
