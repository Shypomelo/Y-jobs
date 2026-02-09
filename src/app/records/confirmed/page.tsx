"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useReport, RecordItem, PartPair, PhotoItem, getRegionFromLocation, getLocationKeyFromSiteName } from "../../providers";

const HANDLERS_OPTIONS = ["柚子", "QQ", "俊傑", "竹哥"] as const;
const WORK_TYPES = ["優化器", "逆變器", "線管路", "監控", "房屋"] as const;

export default function ConfirmedRecordsPage() {
    const { recordsConfirmedItems, unconfirmRecord, updateRecord } = useReport();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState<"全區" | "北區" | "中區" | "南區">("全區");

    // Form State (Same as RecordsPage)
    const [formData, setFormData] = useState<{
        handlers: string[];
        siteName: string;
        workType: "優化器" | "逆變器" | "線管路" | "監控" | "房屋";
        pairs: PartPair[];
        photos: PhotoItem[];
        completedDate: string;
    }>({
        handlers: ["", ""],
        siteName: "",
        workType: "優化器",
        pairs: [],
        photos: [],
        completedDate: ""
    });

    const pairRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        if (regionFilter === "全區") return recordsConfirmedItems;
        return recordsConfirmedItems.filter(item => {
            const locationKey = getLocationKeyFromSiteName(item.siteName);
            const r = item.region || getRegionFromLocation(locationKey);
            return r === regionFilter;
        });
    }, [recordsConfirmedItems, regionFilter]);

    // Modal & Form Handlers
    const openEditModal = (item: RecordItem) => {
        setEditId(item.id);
        const currentHandlers = item.handlers.length > 0 ? item.handlers : ["", ""];

        setFormData({
            handlers: currentHandlers,
            siteName: item.siteName,
            workType: item.workType,
            pairs: item.pairs.map(p => ({ ...p })),
            photos: item.photos.map(p => ({ ...p })),
            completedDate: item.completedDate || (item.createdAtDate ? item.createdAtDate.replace(/\//g, "-") : "")
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
    };

    const handleSubmit = () => {
        if (!editId) return;

        const validHandlers = formData.handlers.filter(h => h.trim() !== "");
        if (validHandlers.length === 0) {
            alert("請至少選擇一位處理人員");
            return;
        }
        if (!formData.siteName) {
            alert("請填寫案場名稱");
            return;
        }

        const locationKey = getLocationKeyFromSiteName(formData.siteName);
        const region = getRegionFromLocation(locationKey);

        updateRecord(editId, {
            handlers: validHandlers,
            siteName: formData.siteName,
            workType: formData.workType,
            pairs: formData.pairs,
            photos: formData.photos,
            completedDate: formData.completedDate,
            region: region
        });

        closeModal();
    };

    const handleReturn = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("確認退回此紀錄至「維修紀錄 (未確認)」列表？")) {
            unconfirmRecord(id);
        }
    };

    // --- Form Field Handlers (duplicated from RecordsPage for standalone function) ---
    const handleHandlerChange = (index: number, value: string) => {
        setFormData(prev => {
            const newHandlers = [...prev.handlers];
            newHandlers[index] = value;
            return { ...prev, handlers: newHandlers };
        });
    };
    const addHandlerSlot = () => setFormData(prev => ({ ...prev, handlers: [...prev.handlers, ""] }));
    const removeHandlerSlot = (index: number) => {
        if (formData.handlers.length <= 1) return;
        setFormData(prev => ({ ...prev, handlers: prev.handlers.filter((_, i) => i !== index) }));
    };
    const handlePairChange = (id: string, field: keyof PartPair, value: string) => {
        setFormData(prev => ({ ...prev, pairs: prev.pairs.map(p => p.id === id ? { ...p, [field]: value } : p) }));
    };
    const addPair = () => setFormData(prev => ({ ...prev, pairs: [...prev.pairs, { id: crypto.randomUUID(), oldModel: "", oldSerial: "", newModel: "", newSerial: "" }] }));
    const removePair = (id: string) => {
        setFormData(prev => ({ ...prev, pairs: prev.pairs.filter(p => p.id !== id) }));
    };
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPhotos: PhotoItem[] = files.map(file => ({
                id: crypto.randomUUID(),
                name: file.name,
                url: URL.createObjectURL(file)
            }));
            setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
        }
    };
    const removePhoto = (id: string) => {
        setFormData(prev => {
            const target = prev.photos.find(p => p.id === id);
            if (target && target.url) URL.revokeObjectURL(target.url);
            return { ...prev, photos: prev.photos.filter(p => p.id !== id) };
        });
    };
    const handleKeyDown = (e: React.KeyboardEvent, index: number, colType: 'newSerial' | 'oldSerial') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (colType === 'newSerial') {
                const oldSerialIndex = index * 4 + 3;
                pairRefs.current[oldSerialIndex]?.focus();
            } else if (colType === 'oldSerial') {
                const nextRowNewSerialIndex = (index + 1) * 4 + 2;
                if (pairRefs.current[nextRowNewSerialIndex]) {
                    pairRefs.current[nextRowNewSerialIndex]?.focus();
                } else {
                    addPair();
                    setTimeout(() => { pairRefs.current[nextRowNewSerialIndex]?.focus(); }, 50);
                }
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20 font-sans">
            <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/records"
                            className="flex items-center justify-center size-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            已確認維修
                        </h1>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto p-4 md:p-6">

                {/* Region Filter & Back Link */}
                <div className="flex items-center mb-4 gap-4">
                    <Link
                        href="/records"
                        className="px-4 py-1.5 rounded-md text-sm font-medium transition-all bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        回到維修紀錄
                    </Link>
                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700"></div>
                    <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                        {(["全區", "北區", "中區", "南區"] as const).map((region) => (
                            <button
                                key={region}
                                onClick={() => setRegionFilter(region)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${regionFilter === region
                                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                                        : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">處理人員</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">案場名稱</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">處理項目</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">更換品項</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">維修相片</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">完成時間</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">操作(詳細)</th>
                                    <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">退回</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                            {regionFilter === "全區" ? "尚無已確認的維修紀錄" : `無${regionFilter}已確認維修紀錄`}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400 max-w-[150px] truncate">{item.handlers.join("、")}</td>
                                            <td className="px-6 py-4 text-stone-800 dark:text-stone-200 font-medium">{item.siteName}</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                                    {item.workType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{item.pairs.length} 組</td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {item.photos.length > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        {item.photos.slice(0, 2).map((p, i) => (
                                                            p.url ? (
                                                                <img key={i} src={p.url} className="size-6 rounded object-cover border border-stone-200" alt="thumb" />
                                                            ) : (
                                                                <span key={i} className="text-[10px] bg-stone-100 px-1 rounded truncate max-w-[50px]">{p.name}</span>
                                                            )
                                                        ))}
                                                        {item.photos.length > 2 && <span className="text-xs text-stone-500">+{item.photos.length - 2}</span>}
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400 font-mono text-xs">{item.completedDate || item.createdAtDate}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                                >
                                                    詳細
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => handleReturn(item.id, e)}
                                                    className="text-stone-400 hover:text-red-500 font-medium text-sm transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-lg">undo</span>
                                                    退回
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

            {/* Editing Modal (Same visual as RecordsPage, but for Confirmed items) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-stone-100 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">編輯已確認紀錄</h3>
                            <button onClick={closeModal} className="size-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Standard Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 mb-2">處理人員</label>
                                    <div className="space-y-2">
                                        {formData.handlers.map((handler, index) => (
                                            <div key={index} className="flex gap-2">
                                                <select
                                                    value={handler}
                                                    onChange={e => handleHandlerChange(index, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                                >
                                                    <option value="">請選擇</option>
                                                    {HANDLERS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                {formData.handlers.length > 1 && (
                                                    <button onClick={() => removeHandlerSlot(index)} className="size-9 rounded-lg border border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={addHandlerSlot} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">add</span> 新增處理人員
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">案場名稱</label>
                                            <input type="text" value={formData.siteName} onChange={e => setFormData({ ...formData, siteName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">處理項目</label>
                                            <select value={formData.workType} onChange={e => setFormData({ ...formData, workType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                                                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-stone-500 mb-1">完成時間</label>
                                            <input type="date" value={formData.completedDate} onChange={e => setFormData({ ...formData, completedDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pairs */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300">更換料件明細</label>
                                    <button onClick={addPair} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span> 新增一組
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.pairs.map((pair, index) => (
                                        <div key={pair.id} className="relative bg-stone-50 dark:bg-stone-800/30 p-4 rounded-lg border border-stone-100 dark:border-stone-800 group">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="block text-[10px] text-stone-400 mb-1">舊型號</label><input ref={el => { pairRefs.current[index * 4 + 1] = el }} type="text" value={pair.oldModel} onChange={e => handlePairChange(pair.id, "oldModel", e.target.value)} className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-stone-800" placeholder="輸入" /></div>
                                                <div><label className="block text-[10px] text-stone-400 mb-1">舊序號</label><input ref={el => { pairRefs.current[index * 4 + 3] = el }} type="text" value={pair.oldSerial} onChange={e => handlePairChange(pair.id, "oldSerial", e.target.value)} onKeyDown={e => handleKeyDown(e, index, 'oldSerial')} className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-stone-800" placeholder="掃碼" /></div>
                                                <div><label className="block text-[10px] text-stone-400 mb-1">新型號</label><input ref={el => { pairRefs.current[index * 4 + 0] = el }} type="text" value={pair.newModel} onChange={e => handlePairChange(pair.id, "newModel", e.target.value)} className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-stone-800" placeholder="輸入" /></div>
                                                <div><label className="block text-[10px] text-stone-400 mb-1">新序號</label><input ref={el => { pairRefs.current[index * 4 + 2] = el }} type="text" value={pair.newSerial} onChange={e => handlePairChange(pair.id, "newSerial", e.target.value)} onKeyDown={e => handleKeyDown(e, index, 'newSerial')} className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-700 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-stone-800" placeholder="掃碼" /></div>
                                            </div>
                                            <div className="flex justify-center mt-3 border-t border-stone-100 dark:border-stone-700/50 pt-2">
                                                <button onClick={() => removePair(pair.id)} className="text-stone-400 hover:text-red-500 transition-colors p-1" tabIndex={-1}><span className="material-symbols-outlined text-xl">delete</span></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Photos */}
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-2">維修相片</label>
                                <div className="flex flex-wrap items-center gap-3">
                                    {formData.photos.map((photo) => (
                                        <div key={photo.id} className="relative group size-20 rounded-lg border border-stone-200 overflow-hidden bg-stone-50"><img src={photo.url} alt="preview" className="w-full h-full object-cover" /><button onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 size-5 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-sm">close</span></button></div>
                                    ))}
                                    <label className="cursor-pointer size-20 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-400 border border-stone-200 border-dashed flex flex-col items-center justify-center transition-colors text-xs gap-1"><span className="material-symbols-outlined text-2xl">add_a_photo</span>上傳<input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 flex justify-end gap-3 shrink-0">
                            <button onClick={closeModal} className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors text-sm font-medium">取消</button>
                            <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-primary/10 text-primary-dark hover:bg-primary/20 transition-colors text-sm font-bold shadow-sm border border-primary/20">儲存更新</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
