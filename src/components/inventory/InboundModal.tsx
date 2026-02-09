"use client";

import { useState, useRef, useEffect } from "react";
import { InboundEvent, InventoryItem, InboundItem } from "@/components/inventory/types";
import { SE_MODELS } from "@/components/inventory/seModels";

type Props = {
    event?: InboundEvent; // If editing
    inventoryItems: InventoryItem[]; // For dropdown (General Inventory)
    onClose: () => void;
    onSave: (event: InboundEvent) => void;
    onVerify?: (event: InboundEvent) => void;
    onDelete?: (id: string) => void;
};

export default function InboundModal({ event, inventoryItems, onClose, onSave, onVerify, onDelete }: Props) {
    const isEdit = !!event;

    // Helpers
    const SOURCE_OPTIONS = ["中辦移轉", "南辦移轉", "SE寄送", "SE倉庫自取", "物料申請", "案場退料"];

    // Form State
    const [source, setSource] = useState(event?.source || "中辦移轉");
    // New: Category State
    const [category, setCategory] = useState<"se" | "se_provided" | "general" | "">(event?.category || "");

    const [siteName, setSiteName] = useState(event?.siteName || "");
    const [items, setItems] = useState<InboundItem[]>(
        event?.items && event.items.length > 0
            ? event.items
            : [{ id: crypto.randomUUID(), itemName: "", quantity: 1 }]
    );
    const [inboundPerson, setInboundPerson] = useState(event?.inboundPerson || "");
    const [deleteCount, setDeleteCount] = useState(0);

    // Form State (Restored)
    const [inboundDate, setInboundDate] = useState(event?.date || new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState(event?.note || "");

    // Autocomplete State (Restored)
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Auto-complete Logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setActiveItemIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Determine Autocomplete Source
    const getCandidates = (input: string) => {
        const lowerVal = input.toLowerCase();
        let candidateList: string[] = [];

        if (["中辦移轉", "南辦移轉", "SE寄送", "SE倉庫自取"].includes(source)) {
            // Use SE Models
            candidateList = SE_MODELS;
        } else {
            // Use General Inventory Models
            candidateList = inventoryItems.map(i => i.model);
        }

        return candidateList
            .filter(model => model.toLowerCase().includes(lowerVal))
            .slice(0, 10);
    };

    const handleItemChange = (index: number, field: keyof InboundItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev];
            const item = { ...newItems[index] };

            if (field === "itemName") {
                item.itemName = value;
                // Filter suggestions
                if (value) {
                    const filtered = getCandidates(value);
                    setSuggestions(filtered);
                    if (filtered.length > 0) setActiveItemIndex(index);
                    else setActiveItemIndex(null);
                } else {
                    setActiveItemIndex(null);
                }
            } else if (field === "quantity") {
                item.quantity = Math.max(1, Number(value));
            }

            newItems[index] = item;
            return newItems;
        });
    };

    const selectSuggestion = (index: number, val: string) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index].itemName = val;
            return newItems;
        });
        setActiveItemIndex(null);
    };

    const addItemRow = () => {
        setItems(prev => [...prev, { id: crypto.randomUUID(), itemName: "", quantity: 1 }]);
    };

    const removeItemRow = (index: number) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteClick = () => {
        if (!onDelete || !event?.id) return;

        if (deleteCount < 1) {
            setDeleteCount(prev => prev + 1);
        } else {
            onDelete(event.id);
            onClose();
        }
    };

    const handleQuickSave = (field: keyof InboundEvent, val: any) => {
        if (!event) return;
        const updatedEvent = { ...event, [field]: val, siteName: source === "案場退料" ? siteName : (event.siteName || "") };

        onSave(updatedEvent);
    };

    // Editable Field Component
    const EditableField = ({ label, value, onChange, onQuickSave, placeholder }: { label: string, value: string, onChange: (val: string) => void, onQuickSave: (val: string) => void, placeholder?: string }) => {
        const [isEditing, setIsEditing] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isEditing]);

        const handleBlur = () => {
            setIsEditing(false);
            onQuickSave(value);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") handleBlur();
            if (e.key === "Escape") {
                setIsEditing(false);
                setIsEditing(false);
            }
        };

        if (isEditing) {
            return (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">{label}</label>
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none ring-2 ring-primary/20 border-primary dark:bg-stone-800 dark:text-white"
                        placeholder={placeholder}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1.5 group cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider group-hover:text-primary transition-colors">{label} <span className="text-[10px] font-normal text-stone-300 ml-1">(雙擊修改)</span></label>
                <div className="h-10 w-full rounded-lg border border-transparent hover:border-stone-200 hover:bg-stone-50 px-3 flex items-center text-sm transition-all dark:hover:bg-stone-800/50 dark:text-stone-300">
                    {value || <span className="text-stone-400 italic">{placeholder || "未填寫"}</span>}
                </div>
            </div>
        );
    };

    const handleSubmit = () => {
        // Validation for Category
        if (!category) {
            alert("請選擇入庫類別");
            return;
        }

        if (source === "案場退料" && !siteName.trim()) {
            alert("請填寫案場名稱");
            return;
        }

        const validItems = items.filter(i => i.itemName.trim() !== "");
        if (validItems.length === 0) {
            alert("請至少填寫一項有效品項");
            return;
        }

        const newEvent: InboundEvent = {
            id: event?.id || crypto.randomUUID(),
            siteName: source === "案場退料" ? siteName : "",
            items: validItems,
            source,
            category: category as "se" | "se_provided" | "general",
            date: inboundDate,
            note,
            inboundPerson,
            status: event?.status || "Pending",
        };

        onSave(newEvent);
    };

    const handleVerifyWrapper = () => {
        if (!onVerify || !event) return;

        // Validation for Category
        if (!category) {
            alert("請選擇入庫類別");
            return;
        }

        if (source === "案場退料" && !siteName.trim()) {
            alert("請填寫案場名稱");
            return;
        }

        const updatedEvent: InboundEvent = {
            ...event,
            siteName: source === "案場退料" ? siteName : "",
            items: items.filter(i => i.itemName.trim() !== ""),
            source,
            category: category as "se" | "se_provided" | "general",
            date: inboundDate,
            note,
            inboundPerson,
        };
        onVerify(updatedEvent);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                        {isEdit ? "編輯入庫單" : "新增入庫單"}
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Source & Site Name Logic */}
                    <div className="space-y-4">
                        {/* Inbound Person - Double Click Edit if isEdit, else Input */}
                        {isEdit ? (
                            <EditableField
                                label="入庫人員"
                                value={inboundPerson}
                                onChange={setInboundPerson}
                                onQuickSave={(val) => handleQuickSave("inboundPerson", val)}
                                placeholder="輸入入庫人員..."
                            />
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">入庫人員</label>
                                <input
                                    value={inboundPerson}
                                    onChange={(e) => setInboundPerson(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    placeholder="輸入入庫人員..."
                                />
                            </div>
                        )}

                        {/* Category Dropdown (NEW) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">入庫類別 <span className="text-red-500">*</span></label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                            >
                                <option value="" disabled>請選擇庫存類別...</option>
                                <option value="se">Solaredge(陽光)</option>
                                <option value="se_provided">Solaredge提供</option>
                                <option value="general">一般物料耗材</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">來源 <span className="text-red-500">*</span></label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                            >
                                {SOURCE_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {source === "案場退料" && (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">案場名稱 <span className="text-red-500">*</span></label>
                                <input
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    placeholder="輸入案場名稱..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                            <label className="text-sm font-bold text-stone-800 dark:text-stone-200">入庫品項明細</label>
                            <button
                                onClick={addItemRow}
                                className="text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                新增品項
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="relative flex gap-3 items-start">
                                    {/* Item Name with Autocomplete */}
                                    <div className="flex-1 relative">
                                        <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">品項名稱</label>
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-stone-300 dark:bg-stone-800 dark:text-white"
                                            placeholder={["中辦移轉", "南辦移轉", "SE寄送", "SE倉庫自取"].includes(source) ? "輸入或選擇 SE 型號..." : "輸入或選擇庫存品項..."}
                                        />
                                        {/* Suggestions */}
                                        {activeItemIndex === index && suggestions.length > 0 && (
                                            <div ref={suggestionRef} className="absolute z-50 left-0 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <ul className="max-h-40 overflow-y-auto">
                                                    {suggestions.map((sugo) => (
                                                        <li
                                                            key={sugo}
                                                            onClick={() => selectSuggestion(index, sugo)}
                                                            className="px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer border-b border-stone-50 dark:border-stone-800 last:border-0"
                                                        >
                                                            {sugo}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="w-24">
                                        <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">數量</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all text-center font-bold dark:bg-stone-800 dark:text-white"
                                        />
                                    </div>

                                    {/* Delete Row */}
                                    {items.length > 1 && (
                                        <button
                                            onClick={() => removeItemRow(index)}
                                            className="mt-6 p-2 text-stone-300 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">入庫日期</label>
                        <input
                            type="date"
                            value={inboundDate}
                            onChange={(e) => setInboundDate(e.target.value)}
                            className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                    </div>

                    {/* Note */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">備註</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-20 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white resize-none"
                            placeholder="選填..."
                        />
                    </div>
                </div>

                {/* Footer - Light Buttons, Dark Text */}
                <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center justify-between shrink-0">
                    <div className="flex gap-2">
                        {isEdit && onDelete && (
                            deleteCount > 0 ? (
                                <button
                                    onClick={handleDeleteClick}
                                    className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors"
                                >
                                    確定刪除?
                                </button>
                            ) : (
                                <button
                                    onClick={handleDeleteClick}
                                    className="px-4 py-2 rounded-lg text-red-400 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    刪除
                                </button>
                            )
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-stone-500 font-medium hover:bg-stone-200 transition-colors"
                        >
                            取消
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {onVerify && event && event.status === "Pending" && (
                            <button
                                onClick={handleVerifyWrapper}
                                className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-bold hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                核許入庫
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-lg bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 transition-all shadow-sm"
                        >
                            {isEdit ? "儲存更新" : "建立入庫單"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

