"use client";

import { useState } from "react";
import Link from "next/link";
import { useReport, JournalItem } from "../providers";


export default function JournalPage() {
    const { journalOpenItems, addJournalRow, updateJournalItem, closeJournalItem, addJournalEntry } = useReport();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editField, setEditField] = useState<"processStatus" | "description" | "location" | "remark" | "siteName" | "source" | null>(null);
    const [editValue, setEditValue] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filterRegion, setFilterRegion] = useState("全區");

    // Direct Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [newReport, setNewReport] = useState({
        siteName: "",
        source: "",
        repairCategory: "",
        contactInfo: "",
        description: "",
        remark: ""
    });

    const handleStatusChange = (id: string, newStatus: JournalItem["status"]) => {
        const item = journalOpenItems.find(i => i.id === id);
        if (!item || item.isClosed) return;

        const updates: Partial<JournalItem> = { status: newStatus };
        if (newStatus === "已完成") {
            if (!item.completedAt) {
                const now = new Date();
                updates.completedAt = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
            }
        } else {
            updates.completedAt = "";
        }
        updateJournalItem(id, updates);
    };

    const handleCloseCase = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (processingId === id) return;
        setProcessingId(id);
        setTimeout(() => {
            closeJournalItem(id);
            setProcessingId(null);
        }, 50);
    };

    const startEditing = (item: JournalItem, field: "processStatus" | "description" | "location" | "remark" | "siteName" | "source") => {
        setEditingId(item.id);
        setEditField(field);
        setEditValue(item[field] || "");
    };

    const saveEdit = (id: string) => {
        if (editField) {
            if (editField === "siteName" && !editValue.trim()) {
                setEditingId(null);
                setEditField(null);
                return;
            }
            updateJournalItem(id, { [editField]: editValue });
        }
        setEditingId(null);
        setEditField(null);
    };

    const handleDirectReport = () => {
        if (!newReport.siteName || !newReport.source || !newReport.repairCategory || !newReport.description) {
            alert("請填寫必填欄位 (案場名稱、來源、待修類別、問題描述)");
            return;
        }
        addJournalEntry({
            status: "待處理",
            siteName: newReport.siteName,
            source: newReport.source,
            description: newReport.description,
            processStatus: "",
            handler: "",
            completedAt: "",
            createdDateISO: new Date().toISOString().split('T')[0],
            remark: newReport.remark,
            location: "",
            region: "北區",
            reporter: "直接回報",
            fingerprint: "",
            repairCategory: newReport.repairCategory,
            contactInfo: newReport.contactInfo
        });
        setIsReportModalOpen(false);
        setNewReport({
            siteName: "",
            source: "",
            repairCategory: "",
            contactInfo: "",
            description: "",
            remark: ""
        });
    };

    const calculateDays = (createdDateISO: string) => {
        if (!createdDateISO) return 0;
        const start = new Date(createdDateISO);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const getRegionFromSiteName = (siteName: string): string => {
        const prefix = siteName.substring(0, 4);
        const north = ["新竹", "基隆", "台北", "新北", "桃園", "宜蘭"];
        const central = ["苗栗", "台中", "彰化", "南投"];
        const south = ["雲林", "嘉義", "台南", "高雄", "屏東", "花蓮", "台東"];

        for (const city of north) if (prefix.includes(city)) return "北區";
        for (const city of central) if (prefix.includes(city)) return "中區";
        for (const city of south) if (prefix.includes(city)) return "南區";

        return "南區"; // Default to South or "全區可見" (User suggested one consistent choice)
    };

    const regionOptions = ["全區", "北區", "中區", "南區"];
    const sourceOptions = ["Solaredge", "慧景", "友達", "台達", "新旺", "業主報修"];

    const filteredItems = journalOpenItems.filter(item => {
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
                        className="flex items-center justify-center size-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-stone-500">assignment</span>
                        維運總表
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">report</span>
                        通報
                    </button>
                    <Link
                        href="/journal/resolved"
                        className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        已修復案場
                    </Link>
                    <button
                        onClick={addJournalRow}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium text-sm shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        新增測試列
                    </button>
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
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[110px]">狀態</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[120px]">案場名稱</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[100px]">來源</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 min-w-[200px] max-w-[300px]">問題描述</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 min-w-[200px]">處理狀況</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[120px]">備註</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[80px]">天數</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[110px]">完成日期</th>
                                    <th className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300 w-[80px]">審核</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                            尚無{filterRegion !== "全區" ? filterRegion : ""}資料
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                                                    className={`w-full border-0 p-1 text-xs font-bold rounded cursor-pointer focus:ring-2 focus:ring-stone-200 transition-colors ${item.status === '待處理' ? 'bg-orange-50 text-orange-700' :
                                                        item.status === '觀察中' ? 'bg-purple-50 text-purple-700' :
                                                            item.status === '處理中' ? 'bg-blue-50 text-blue-700' :
                                                                item.status === '已完成' ? 'bg-green-50 text-green-700' :
                                                                    'bg-orange-50 text-orange-700' // Default/Empty
                                                        }`}
                                                >
                                                    <option value="待處理" className="bg-orange-50 text-orange-700">待處理</option>
                                                    <option value="處理中" className="bg-blue-50 text-blue-700">處理中</option>
                                                    <option value="觀察中" className="bg-purple-50 text-purple-700">觀察中</option>
                                                    <option value="已完成" className="bg-green-50 text-green-700">已完成</option>
                                                </select>
                                            </td>
                                            <td
                                                className="px-4 py-3 text-stone-800 dark:text-stone-200 font-medium cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
                                                onDoubleClick={() => startEditing(item, "siteName")}
                                            >
                                                {editingId === item.id && editField === "siteName" ? (
                                                    <input
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveEdit(item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") saveEdit(item.id);
                                                            if (e.key === "Escape") {
                                                                setEditingId(null);
                                                                setEditField(null);
                                                            }
                                                        }}
                                                        className="w-full bg-white dark:bg-stone-800 border border-primary px-2 py-1 rounded outline-none"
                                                    />
                                                ) : (
                                                    item.siteName
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                <select
                                                    value={item.source}
                                                    onChange={(e) => updateJournalItem(item.id, { source: e.target.value })}
                                                    className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer hover:text-primary transition-colors pr-4"
                                                >
                                                    {sourceOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                    {!sourceOptions.includes(item.source) && item.source && (
                                                        <option value={item.source}>{item.source}</option>
                                                    )}
                                                </select>
                                            </td>

                                            {/* Description - Editable */}
                                            <td
                                                className="px-4 py-3 text-stone-600 dark:text-stone-400 cursor-text group relative"
                                                onDoubleClick={() => startEditing(item, "description")}
                                            >
                                                {editingId === item.id && editField === "description" ? (
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveEdit(item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(item.id); }
                                                            if (e.key === 'Escape') { setEditingId(null); setEditField(null); }
                                                        }}
                                                        autoFocus
                                                        className="w-full h-[60px] p-2 text-sm rounded border border-blue-500 bg-white dark:bg-stone-800 focus:outline-none resize-none shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-between w-full min-h-[24px]">
                                                        <span className="truncate block max-w-[300px]" title={item.description}>
                                                            {item.description.split('\n')[0] || "-"}
                                                            {item.description.split('\n').length > 1 && <span className="text-stone-400 ml-1">...</span>}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Process Status - Editable */}
                                            <td
                                                className="px-4 py-3 text-stone-600 dark:text-stone-300 cursor-text group relative"
                                                onDoubleClick={() => startEditing(item, "processStatus")}
                                            >
                                                {editingId === item.id && editField === "processStatus" ? (
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveEdit(item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(item.id); }
                                                            if (e.key === 'Escape') { setEditingId(null); setEditField(null); }
                                                        }}
                                                        autoFocus
                                                        className="w-full h-[60px] p-2 text-sm rounded border border-primary bg-white dark:bg-stone-800 focus:outline-none resize-none shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-between w-full min-h-[24px]">
                                                        <span className="truncate block max-w-[200px]" title={item.processStatus}>
                                                            {item.processStatus.split('\n')[0] || <span className="text-stone-300 italic">雙擊編輯...</span>}
                                                            {item.processStatus.split('\n').length > 1 && <span className="text-stone-400 ml-1">...</span>}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Remark - Editable */}
                                            <td
                                                className="px-4 py-3 text-stone-500 dark:text-stone-400 cursor-text group relative"
                                                onDoubleClick={() => startEditing(item, "remark")}
                                            >
                                                {editingId === item.id && editField === "remark" ? (
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => saveEdit(item.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(item.id); }
                                                            if (e.key === 'Escape') { setEditingId(null); setEditField(null); }
                                                        }}
                                                        autoFocus
                                                        className="w-full h-[60px] p-2 text-sm rounded border border-primary bg-white dark:bg-stone-800 focus:outline-none resize-none shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-between w-full min-h-[24px]">
                                                        <span className="truncate block max-w-[150px]" title={item.remark}>
                                                            {item.remark || "-"}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Days */}
                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                                                <span className={`inline-block px-2 text-xs font-semibold rounded ${calculateDays(item.createdDateISO) > 7 ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-600"
                                                    }`}>
                                                    {calculateDays(item.createdDateISO)}天
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-stone-600 dark:text-stone-400 font-mono text-xs">
                                                {item.completedAt || "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => handleCloseCase(e, item.id)}
                                                    disabled={item.status !== "已完成" || processingId === item.id}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all border ${item.status === "已完成" && processingId !== item.id
                                                        ? "bg-white text-green-600 border-green-600 hover:bg-green-50 dark:bg-stone-900 dark:text-green-400 dark:hover:bg-green-900/20 shadow-sm"
                                                        : "bg-stone-50 text-stone-400 border-stone-200 dark:bg-stone-900 dark:text-stone-600 dark:border-stone-800 cursor-not-allowed"
                                                        }`}
                                                >
                                                    {processingId === item.id ? "處理中..." : "結案"}
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

            {/* Direct Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/30">
                            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">report</span>
                                案件通報
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 ml-1">案場名稱 *</label>
                                <input
                                    value={newReport.siteName}
                                    onChange={(e) => setNewReport({ ...newReport, siteName: e.target.value })}
                                    placeholder="請輸入案場"
                                    className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 ml-1">來源 *</label>
                                    <select
                                        value={newReport.source}
                                        onChange={(e) => setNewReport({ ...newReport, source: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">請選擇</option>
                                        <option value="Solaredge">Solaredge</option>
                                        <option value="慧景">慧景</option>
                                        <option value="友達">友達</option>
                                        <option value="台達">台達</option>
                                        <option value="新旺">新旺</option>
                                        <option value="業主報修">業主報修</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 ml-1">待修類別 *</label>
                                    <select
                                        value={newReport.repairCategory}
                                        onChange={(e) => setNewReport({ ...newReport, repairCategory: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">請選擇</option>
                                        <option value="三顆以下優化器">三顆以下優化器</option>
                                        <option value="四顆以上優化器">四顆以上優化器</option>
                                        <option value="逆變器問題">逆變器問題</option>
                                        <option value="線管路問題">線管路問題</option>
                                        <option value="監控問題">監控問題</option>
                                        <option value="房屋問題">房屋問題</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 ml-1">聯絡方式 (可選)</label>
                                <input
                                    value={newReport.contactInfo}
                                    onChange={(e) => setNewReport({ ...newReport, contactInfo: e.target.value })}
                                    placeholder="請輸入姓名/電話/LINE 等"
                                    className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 ml-1">問題描述 *</label>
                                <textarea
                                    value={newReport.description}
                                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                                    rows={3}
                                    placeholder="請詳細描述異常內容..."
                                    className="w-full p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 ml-1">備註 (可選)</label>
                                <input
                                    value={newReport.remark}
                                    onChange={(e) => setNewReport({ ...newReport, remark: e.target.value })}
                                    placeholder="對內備註"
                                    className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex justify-end gap-3">
                            <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-sm font-medium">
                                取消
                            </button>
                            <button
                                onClick={handleDirectReport}
                                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold shadow-sm"
                            >
                                確認通報
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
