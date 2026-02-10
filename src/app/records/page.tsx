"use client";

import { useReport, RecordItem, RecordPair, getRegionFromLocation, getLocationKeyFromSiteName } from "@/app/providers";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
// Removed: import { getTaiwanDate } from "@/lib/dateUtils";

// Simple Taiwanese Date Date Helper
const getTaiwanDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getFullYear() - 1911}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

// --- Inventory Models for Auto-complete ---
const INVENTORY_MODELS = [
    "SE3000H-RW000BEN4備機",
    "SE3000H-TW000BEN4備機",
    "SE5000H-RW000BEN4備機",
    "SE5000H-RW000BEN4",
    "SESUK-RW00INNN4",
    "SESUK-RW00INNN4副機備機",
    "SE82.8K-RW0P0BNY4",
    "S440-1GRAM4MRM-NA02",
    "P401I-5RM4MRM",
    "P500-5RM4MRM",
    "P701-4RMLMRL",
    "P801-4RMLMRY",
    "P850-4RMLMRY",
    "SE1000-GSM02-B",
    "S1000",
    "SE4000H",
    "R800",
];

// --- Local Interfaces for Grouped UI ---
interface SerialPairInput {
    id: string;
    newSerial: string;
    oldSerial: string;
}

interface RecordGroup {
    id: string;
    newModel: string;
    oldModel: string;
    quantity: number;
    pairs: SerialPairInput[];
}

export default function RecordsPage() {
    const { recordsItems, recordsConfirmedItems, addRecord, updateRecord, confirmRecord, deleteRecord } = useReport();
    const [filterRegion, setFilterRegion] = useState("全區");

    // Modal State
    const [isApproveMode, setIsApproveMode] = useState(false);

    // Instead of holding the whole object in state, we hold the ID as requested
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    // Derived target record (always fresh from store)
    const targetRecord = useMemo(() =>
        recordsItems.find(r => r.id === selectedRecordId) || null
        , [recordsItems, selectedRecordId]);

    const [deleteCount, setDeleteCount] = useState(0); // 0, 1, 2, 3(Action)

    // Form State
    const [siteName, setSiteName] = useState("");
    const [workType, setWorkType] = useState<RecordItem["workType"]>("優化器"); // Default
    const [handlers, setHandlers] = useState<string[]>(["", ""]); // Default 2 empty slots

    // Grouped Pairs State
    const [groups, setGroups] = useState<RecordGroup[]>([]);

    const [photos, setPhotos] = useState<{ id: string, name: string, url?: string }[]>([]);
    const [completedDate, setCompletedDate] = useState("");

    // Auto-complete State
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const regionOptions = ["全區", "北區", "中區", "南區"];
    const HANDLERS_OPTIONS = ["柚子", "QQ", "俊傑", "竹哥", "阿龍", "工務"] as const;

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setActiveGroupIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Helper: Initialize a new group
    const createNewGroup = (): RecordGroup => ({
        id: crypto.randomUUID(),
        newModel: "",
        oldModel: "",
        quantity: 1,
        pairs: [{ id: crypto.randomUUID(), newSerial: "", oldSerial: "" }]
    });

    // Handler to open modal (New or Edit)
    const openModal = (record?: RecordItem) => {
        if (record) {
            // Requirement: Use Record ID to find data
            const freshRecord = recordsItems.find(r => r.id === record.id);
            if (!freshRecord) return; // Should not happen if passed from map

            setSelectedRecordId(freshRecord.id);
            setSiteName(freshRecord.siteName);
            setWorkType(freshRecord.workType);
            setHandlers(freshRecord.handlers && freshRecord.handlers.length > 0 ? freshRecord.handlers : ["", ""]);
            setPhotos(freshRecord.photos || []);
            setCompletedDate(freshRecord.completedDate || "");

            // Convert flat pairs to groups
            if (freshRecord.pairs && freshRecord.pairs.length > 0) {
                const groupedMap = new Map<string, RecordGroup>();

                freshRecord.pairs.forEach(p => {
                    const key = `${p.newModel}|${p.oldModel}`;
                    if (!groupedMap.has(key)) {
                        groupedMap.set(key, {
                            id: crypto.randomUUID(), // Group concept doesn't exist in DB, so new ID for UI is fine
                            newModel: p.newModel,
                            oldModel: p.oldModel,
                            quantity: 0,
                            pairs: []
                        });
                    }
                    const group = groupedMap.get(key)!;
                    group.quantity += 1;
                    group.pairs.push({
                        id: p.id, // CRITICAL: Reuse existing pair ID
                        newSerial: p.newSerial,
                        oldSerial: p.oldSerial
                    });
                });
                setGroups(Array.from(groupedMap.values()));
            } else {
                setGroups([]); // No pairs
            }
        } else {
            setSelectedRecordId(null);
            setSiteName("");
            setWorkType("優化器");
            setHandlers(["", ""]); // Default 2 slots
            setPhotos([]);
            setCompletedDate(new Date().toISOString().split('T')[0]);
            // Default 1 empty group
            setGroups([createNewGroup()]);
        }
        setDeleteCount(0); // Reset delete count
        setIsApproveMode(true);
    };

    const closeModal = () => {
        setIsApproveMode(false);
        setSelectedRecordId(null);
        setDeleteCount(0);
        setActiveGroupIndex(null);
    };

    const handleHandlerChange = (index: number, val: string) => {
        const newHandlers = [...handlers];
        newHandlers[index] = val;
        setHandlers(newHandlers);
    };

    const addHandler = () => {
        setHandlers(prev => [...prev, ""]);
    };

    const removeHandler = (index: number) => {
        // Allow removing if more than 1, or just clear if it's the only one
        if (handlers.length <= 1) return;
        setHandlers(prev => prev.filter((_, i) => i !== index));
    };

    // --- Group Logic ---

    const handleAddGroup = () => {
        setGroups(prev => [...prev, createNewGroup()]);
    };

    const handleRemoveGroup = (index: number) => {
        setGroups(prev => prev.filter((_, i) => i !== index));
    };

    const handleGroupChange = (index: number, field: keyof RecordGroup, value: any) => {
        setGroups(prev => {
            const newGroups = [...prev];
            const group = { ...newGroups[index] };

            if (field === "quantity") {
                const newQty = Math.max(1, Math.min(20, Number(value))); // Limit 1-20
                group.quantity = newQty;

                // Adjust pairs array size
                const currentPairs = [...group.pairs];
                if (newQty > currentPairs.length) {
                    // Add pairs
                    for (let i = currentPairs.length; i < newQty; i++) {
                        currentPairs.push({ id: crypto.randomUUID(), newSerial: "", oldSerial: "" });
                    }
                } else if (newQty < currentPairs.length) {
                    // Remove pairs (from end)
                    currentPairs.splice(newQty);
                }
                group.pairs = currentPairs;
            } else if (field === "newModel") {
                group.newModel = value;
                // Auto-complete logic trigger
                if (value) {
                    const lowerVal = value.toLowerCase();
                    const filtered = INVENTORY_MODELS.filter(m => m.toLowerCase().includes(lowerVal))
                        .sort((a, b) => {
                            const aLower = a.toLowerCase();
                            const bLower = b.toLowerCase();
                            // StartsWith priority
                            const aStarts = aLower.startsWith(lowerVal);
                            const bStarts = bLower.startsWith(lowerVal);
                            if (aStarts && !bStarts) return -1;
                            if (!aStarts && bStarts) return 1;
                            // Length priority (shorter first)
                            return a.length - b.length;
                        })
                        .slice(0, 8); // Limit to top 8
                    setSuggestions(filtered);
                    if (filtered.length > 0) setActiveGroupIndex(index);
                    else setActiveGroupIndex(null);
                } else {
                    setSuggestions([]);
                    setActiveGroupIndex(null);
                }
            } else {
                (group as any)[field] = value;
            }

            newGroups[index] = group;
            return newGroups;
        });
    };

    const selectSuggestion = (index: number, model: string) => {
        handleGroupChange(index, "newModel", model);
        setActiveGroupIndex(null); // Close suggestions
    };

    const handleSerialChange = (groupIndex: number, pairIndex: number, field: "newSerial" | "oldSerial", value: string) => {
        setGroups(prev => {
            const newGroups = [...prev];
            const group = { ...newGroups[groupIndex] };
            const newPairs = [...group.pairs];
            newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };
            group.pairs = newPairs;
            newGroups[groupIndex] = group;
            return newGroups;
        });
    };

    const handleDeletePhoto = (id: string) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files).map(file => ({
                id: crypto.randomUUID(),
                name: file.name,
                url: URL.createObjectURL(file)
            }));
            setPhotos(prev => [...prev, ...newPhotos]);
        }
    };

    const handleSubmit = () => {
        if (!siteName) {
            alert("請填寫案場名稱");
            return;
        }

        const validHandlers = handlers.filter(h => h.trim() !== "");

        // Flatten groups to RecordPair[]
        const flatPairs: RecordPair[] = groups.flatMap(group =>
            group.pairs.map(pair => ({
                id: pair.id, // Preserve ID if possible (reused from openModal)
                oldModel: group.oldModel,
                newModel: group.newModel,
                oldSerial: pair.oldSerial,
                newSerial: pair.newSerial
            }))
        );

        const recordData = {
            siteName,
            handlers: validHandlers,
            pairs: flatPairs,
            photos,
            completedDate,
            location: "",
            workType: workType,
            createdAtDate: new Date().toISOString().split('T')[0]
        };

        if (targetRecord) {
            updateRecord(targetRecord.id, recordData);
        } else {
            addRecord(recordData);
        }
        closeModal();
    };

    const handleConfirmTransfer = () => {
        if (!targetRecord) return;

        // 1. Validation
        const validHandlers = handlers.filter(h => h.trim() !== "");
        if (validHandlers.length === 0) {
            alert("請至少選擇一位處理人員以便轉入已確認區");
            return;
        }
        if (!siteName) {
            alert("請填寫案場名稱");
            return;
        }

        // 2. Save current state first (Auto-save)
        const flatPairs: RecordPair[] = groups.flatMap(group =>
            group.pairs.map(pair => ({
                id: pair.id,
                oldModel: group.oldModel,
                newModel: group.newModel,
                oldSerial: pair.oldSerial,
                newSerial: pair.newSerial
            }))
        );

        updateRecord(targetRecord.id, {
            handlers: validHandlers,
            siteName,
            workType,
            pairs: flatPairs,
            photos,
            completedDate
        });

        // 3. Confirm (Move to Confirmed List)
        confirmRecord(targetRecord.id);

        // 4. Close
        closeModal();
    };

    const handleDeleteClick = () => {
        if (!targetRecord) return;

        if (deleteCount < 2) {
            setDeleteCount(prev => prev + 1);
        } else {
            // Third click -> Execute Delete
            deleteRecord(targetRecord.id);
            closeModal();
        }
    };

    const handleDeleteCancel = () => {
        setDeleteCount(0);
    };

    // Filter Logic
    const filteredRecords = useMemo(() => {
        if (filterRegion === "全區") return recordsItems;
        return recordsItems.filter(r => {
            const key = getLocationKeyFromSiteName(r.siteName);
            const reg = r.region || getRegionFromLocation(key);
            return reg === filterRegion;
        });
    }, [recordsItems, filterRegion]);

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <header className="w-full p-4 md:p-6 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">grid_view</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                                YJOB
                            </span>
                        </Link>

                        {/* Confirmed Entry - Desktop */}
                        <Link
                            href="/records/confirmed"
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            已確認維修 ({recordsConfirmedItems.length})
                        </Link>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-stone-100 text-stone-900 rounded-lg shadow-sm hover:bg-stone-200 transition-all font-bold flex items-center gap-2 text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        新增項目
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
                {/* Mobile Confirmed Entry */}
                <Link
                    href="/records/confirmed"
                    className="md:hidden flex items-center justify-between p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/50"
                >
                    <span className="flex items-center gap-2 font-medium text-sm">
                        <span className="material-symbols-outlined">check_circle</span>
                        已確認維修
                    </span>
                    <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                        {recordsConfirmedItems.length}
                    </span>
                </Link>

                {/* Region Filter - Tabs Style */}
                <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
                    {regionOptions.map(region => (
                        <button
                            key={region}
                            onClick={() => setFilterRegion(region)}
                            className={`px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${filterRegion === region
                                ? "text-primary border-b-2 border-primary"
                                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                {/* Table View */}
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[150px]">處理人員</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[180px]">案場名稱</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[100px]">處理項目</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 min-w-[150px]">更換品項</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[100px]">維修相片</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[120px]">完成時間</th>
                                    <th className="px-6 py-4 font-semibold text-stone-700 dark:text-stone-300 w-[100px]">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                            尚無{filterRegion}維修紀錄
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((item) => (
                                        <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-stone-700 dark:text-stone-300">
                                                    {item.handlers && item.handlers.length > 0 ? item.handlers.join("、") : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-100">
                                                {item.siteName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                                    {item.workType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {item.pairs.length > 0 ? (
                                                    <span>{item.pairs.length} 組</span>
                                                ) : (
                                                    <span className="text-stone-400 text-xs italic">無</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.photos && item.photos.length > 0 ? (
                                                    <div className="flex items-center gap-2" onClick={() => openModal(item)}>
                                                        <div className="relative size-10 rounded overflow-hidden border border-stone-200 cursor-pointer hover:border-primary transition-colors">
                                                            <img src={item.photos[0].url || "/placeholder.jpg"} alt="thumb" className="w-full h-full object-cover" />
                                                        </div>
                                                        {item.photos.length > 1 && (
                                                            <span className="text-xs text-stone-500 font-medium">+{item.photos.length - 1}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400 font-mono text-xs">
                                                {item.completedDate ? getTaiwanDate(item.completedDate) : getTaiwanDate(item.createdAtDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="text-primary hover:text-primary/80 font-medium text-sm"
                                                >
                                                    詳細/編輯
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

            {/* Modal */}
            {isApproveMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                                {targetRecord ? "詳細/編輯維修紀錄" : "新增維修紀錄"}
                            </h3>
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Deleting Alert */}
                            {deleteCount > 0 && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 flex items-center justify-center animate-pulse">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                                        <span className="material-symbols-outlined">warning</span>
                                        <span>確認刪除？ (點擊 {3 - deleteCount} 次確認)</span>
                                    </div>
                                </div>
                            )}

                            {/* Row 1: Site Name & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">案場名稱</label>
                                    <input
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        className="input-base"
                                        placeholder="輸入案場名稱"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">處理項目</label>
                                    <select
                                        value={workType}
                                        onChange={(e) => setWorkType(e.target.value as any)}
                                        className="input-base"
                                    >
                                        <option value="優化器">優化器</option>
                                        <option value="逆變器">逆變器</option>
                                        <option value="線管路">線管路</option>
                                        <option value="監控">監控</option>
                                        <option value="房屋">房屋</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Handlers & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">處理人員</label>
                                        <button onClick={addHandler} type="button" className="text-xs text-primary font-bold hover:underline">
                                            + 新增人員
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {handlers.map((h, i) => (
                                            <div key={i} className="flex gap-2">
                                                <select
                                                    value={h}
                                                    onChange={(e) => handleHandlerChange(i, e.target.value)}
                                                    className="input-base"
                                                >
                                                    <option value="" disabled>請選擇人員</option>
                                                    {HANDLERS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                {handlers.length > 1 && (
                                                    <button onClick={() => removeHandler(i)} className="text-stone-400 hover:text-red-500 px-1">
                                                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">完成日期</label>
                                    <input
                                        type="date"
                                        value={completedDate}
                                        onChange={(e) => setCompletedDate(e.target.value)}
                                        className="input-base"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Grouped Items */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                                    <label className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                                        更換料件明細
                                    </label>
                                    <button
                                        onClick={handleAddGroup}
                                        className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        新增一組
                                    </button>
                                </div>

                                {groups.length === 0 ? (
                                    <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-sm">
                                        無更換料件
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {groups.map((group, gIndex) => (
                                            <div key={group.id} className="relative bg-white dark:bg-stone-800 p-5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow">
                                                {/* Remove Group Button */}
                                                <button
                                                    onClick={() => handleRemoveGroup(gIndex)}
                                                    className="absolute top-3 right-3 text-stone-300 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">close</span>
                                                </button>

                                                {/* Model Row */}
                                                <div className="flex gap-4 mb-4 items-end">
                                                    {/* New Model with Auto-complete */}
                                                    <div className="relative flex-1">
                                                        <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">新型號</label>
                                                        <input
                                                            type="text"
                                                            value={group.newModel}
                                                            onChange={(e) => handleGroupChange(gIndex, "newModel", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono placeholder:text-stone-300"
                                                            placeholder="輸入或選擇..."
                                                        />
                                                        {/* Auto-complete Dropdown */}
                                                        {activeGroupIndex === gIndex && suggestions.length > 0 && (
                                                            <div ref={suggestionRef} className="absolute z-50 left-0 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                <ul className="max-h-48 overflow-y-auto">
                                                                    {suggestions.map((sugo) => (
                                                                        <li
                                                                            key={sugo}
                                                                            onClick={() => selectSuggestion(gIndex, sugo)}
                                                                            className="px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer border-b border-stone-50 dark:border-stone-800 last:border-0"
                                                                        >
                                                                            {sugo}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Old Model */}
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">舊型號</label>
                                                        <input
                                                            type="text"
                                                            value={group.oldModel}
                                                            onChange={(e) => handleGroupChange(gIndex, "oldModel", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono placeholder:text-stone-300"
                                                            placeholder="輸入舊型號"
                                                        />
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="w-20">
                                                        <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase text-center">更換數</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="20"
                                                            value={group.quantity}
                                                            onChange={(e) => handleGroupChange(gIndex, "quantity", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Serial Grid */}
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-lg border border-stone-100 dark:border-stone-800">
                                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">新序號 (掃碼/輸入)</div>
                                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">舊序號 (掃碼/輸入)</div>

                                                    {group.pairs.map((pair, pIndex) => (
                                                        <div key={pair.id} className="contents">
                                                            <input
                                                                type="text"
                                                                value={pair.newSerial}
                                                                onChange={(e) => handleSerialChange(gIndex, pIndex, "newSerial", e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono placeholder:text-stone-300 bg-white"
                                                                placeholder={`新序號 ${pIndex + 1}`}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={pair.oldSerial}
                                                                onChange={(e) => handleSerialChange(gIndex, pIndex, "oldSerial", e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono placeholder:text-stone-300 bg-white"
                                                                placeholder={`舊序號 ${pIndex + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Row 4 - Photos */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                <label className="text-sm font-bold text-stone-700 dark:text-stone-300">維修相片</label>
                                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                                    {photos.map(p => (
                                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group">
                                            <img src={p.url || "/placeholder.jpg"} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleDeletePhoto(p.id)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-stone-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-primary transition-all">
                                        <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                        <span className="text-[10px] font-bold">上傳</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center justify-between shrink-0">
                            {/* Left: Delete / Approve */}
                            <div className="flex items-center gap-2">
                                {targetRecord && (
                                    <>
                                        {deleteCount > 0 ? (
                                            <button
                                                onClick={handleDeleteClick}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                                            >
                                                {deleteCount === 2 ? "真的要刪除！" : "確定刪除？"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleDeleteClick}
                                                className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                                            >
                                                刪除
                                            </button>
                                        )}
                                        {deleteCount > 0 && (
                                            <button onClick={handleDeleteCancel} className="text-stone-400 hover:text-stone-600 text-sm">取消</button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Middle: Confirm Transfer */}
                            {targetRecord && (
                                <button
                                    onClick={handleConfirmTransfer}
                                    className="px-4 py-2 rounded-lg bg-orange-100 text-orange-800 font-bold hover:bg-orange-200 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    確認轉入已確認維修
                                </button>
                            )}

                            {/* Right: Cancel / Save */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg text-stone-500 font-medium hover:bg-stone-200 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 rounded-lg bg-stone-800 text-white font-bold hover:bg-stone-700 hover:shadow-lg transition-all"
                                >
                                    {targetRecord ? "儲存更新" : "送出紀錄"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
                .input-base {
                    @apply h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-900;
                }
                .btn-secondary {
                    @apply rounded-lg border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700;
                }
            `}</style>
        </div>
    );
}
