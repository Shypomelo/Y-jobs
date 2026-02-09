"use client";

import { useState, useRef, useEffect } from "react";
import { OutboundEvent, EventItem, PhotoItem } from "@/app/providers";

type Props = {
    event: OutboundEvent;
    onClose: () => void;
    onSave: (id: string, data: Partial<OutboundEvent>) => void;
    onVerify: (id: string, data: Partial<OutboundEvent>) => void;
    onDelete?: (id: string) => void; // New prop
};

// Fixed Options
const SOURCE_OPTIONS = ["公司庫存", "SE提供", "案場餘料"];

export default function OutboundModal({ event, onClose, onSave, onVerify, onDelete }: Props) {
    const isPending = event.status !== "Verified";

    // Local State for Edit Mode
    const [formData, setFormData] = useState({
        site: event.site,
        date: event.date,
        source: event.source,
        items: event.items ? [...event.items] : [],
        note: event.note || "",
        handlers: event.handlers || []
    });

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

    // Delete State
    const [deleteCount, setDeleteCount] = useState(0);

    // Derived Status Calculation (Pure function to check validity)
    const calculateDerivedStatus = (): "Missing" | "Ready" | "Verified" => {
        if (!isPending) return "Verified";
        // Missing: All items are empty
        if (!formData.items || formData.items.length === 0) return "Missing";

        // Ready: Source Selected
        if (!formData.source) return "Missing";

        return "Ready";
    };

    const derivedStatus = calculateDerivedStatus();

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemName: "", oldSn: "", newSn: "" }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        if (formData.items.length <= 1) return; // Prevent removing last item? Or allow
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: keyof EventItem, value: string) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleSaveClick = () => {
        const status = calculateDerivedStatus();
        onSave(event.id, { ...formData, status });
    };

    const handleVerifyClick = () => {
        if (!formData.source) {
            alert("請選擇來源");
            return;
        }
        // Strict check for items if needed, but 'Ready' status covers it
        if (derivedStatus === "Missing") {
            alert("資料有缺（需填寫來源），無法入帳");
            return;
        }
        if (!confirm("確認將此事件入帳？")) return;

        onVerify(event.id, { ...formData });
    };

    const handleDeleteClick = () => {
        if (!onDelete) return;

        if (deleteCount < 2) {
            setDeleteCount(prev => prev + 1);
        } else {
            onDelete(event.id);
            onClose();
        }
    };

    const handleDeleteCancel = () => {
        setDeleteCount(0);
    };

    // Editable Field Component
    const EditableField = ({
        label,
        value,
        onSave,
        placeholder,
        type = "text",
        options = [],
        renderValue
    }: {
        label: string,
        value: any,
        onSave: (val: any) => void,
        placeholder?: string,
        type?: "text" | "date" | "select" | "textarea",
        options?: string[],
        renderValue?: (val: any) => React.ReactNode
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempValue, setTempValue] = useState(value);
        const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isEditing]);

        // Handlers Helper for Array
        const isArray = Array.isArray(value);

        const handleBlur = () => {
            setIsEditing(false);
            onSave(tempValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && type !== "textarea") handleBlur();
            if (e.key === "Escape") {
                setIsEditing(false);
                setTempValue(value);
            }
        };

        const startEdit = () => {
            setTempValue(value);
            setIsEditing(true);
        };

        if (isEditing) {
            return (
                <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">{label}</label>
                    {type === "select" ? (
                        <select
                            ref={inputRef as any}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="input-edit"
                        >
                            <option value="" disabled>請選擇</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : type === "textarea" ? (
                        <textarea
                            ref={inputRef as any}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="input-edit min-h-[80px] resize-none"
                            placeholder={placeholder}
                        />
                    ) : (
                        <input
                            ref={inputRef as any}
                            type={type}
                            value={isArray ? tempValue.join(",") : tempValue}
                            onChange={(e) => isArray ? setTempValue(e.target.value.split(",")) : setTempValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="input-edit"
                            placeholder={placeholder}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1.5 group cursor-pointer" onDoubleClick={startEdit}>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider group-hover:text-primary transition-colors flex items-center gap-1">
                    {label}
                    {isPending && (label === "來源" || label === "案名") && <span className="text-red-500">*</span>}
                    <span className="text-[10px] font-normal text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">(雙擊修改)</span>
                </label>
                <div className="min-h-[40px] w-full rounded-lg border border-transparent hover:border-stone-200 hover:bg-stone-50 px-3 flex items-center text-sm transition-all dark:hover:bg-stone-800/50 dark:text-stone-300 break-words whitespace-pre-wrap">
                    {renderValue ? renderValue(value) : (value || <span className="text-stone-400 italic">{placeholder || "未填寫"}</span>)}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900 overflow-y-auto max-h-[90vh]">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                            {isPending ? "出庫事件詳細資料" : "已入帳詳細資料"}
                        </h3>
                        <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-stone-800">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>



                    {/* Form Body */}
                    <div className="grid gap-6">
                        {/* Deleting Alert */}
                        {deleteCount > 0 && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                                    <span className="material-symbols-outlined">warning</span>
                                    <div className="font-medium">
                                        確認刪除？ (已確認 {deleteCount}/3)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Row 1: Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableField
                                label="案名"
                                value={formData.site}
                                onSave={(val) => setFormData({ ...formData, site: val })}
                                placeholder="請輸入案名"
                            />
                            <EditableField
                                label="使用日期"
                                type="date"
                                value={formData.date}
                                onSave={(val) => setFormData({ ...formData, date: val })}
                            />
                        </div>

                        {/* Row 2: Handlers */}
                        <EditableField
                            label="處理人員"
                            value={formData.handlers}
                            onSave={(val) => setFormData({ ...formData, handlers: typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val })}
                            placeholder="輸入處理人員 (逗號分隔)..."
                            renderValue={(val: string[]) => (
                                <div className="flex flex-wrap gap-2">
                                    {val && val.length > 0 ? val.map((h, i) => (
                                        <span key={i} className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-xs border border-stone-200 dark:border-stone-700">
                                            {h}
                                        </span>
                                    )) : <span className="text-stone-400">-</span>}
                                </div>
                            )}
                        />

                        {/* Row 3: Source */}
                        <EditableField
                            label="來源"
                            type="select"
                            value={formData.source}
                            onSave={(val) => setFormData({ ...formData, source: val })}
                            options={SOURCE_OPTIONS}
                        />

                        {/* Note */}
                        <EditableField
                            label="備註"
                            type="textarea"
                            value={formData.note}
                            onSave={(val) => setFormData({ ...formData, note: val })}
                            placeholder="選填備註..."
                        />

                        {/* Row 4: Items List */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-stone-500">明細清單</label>
                                <button onClick={handleAddItem} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    新增明細
                                </button>
                            </div>

                            <div className="border border-stone-200 rounded-xl overflow-hidden dark:border-stone-800">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500">
                                        <tr>
                                            <th className="px-3 py-2 font-medium w-1/3">品項</th>
                                            <th className="px-3 py-2 font-medium w-1/4">舊序號</th>
                                            <th className="px-3 py-2 font-medium w-1/4">新序號</th>
                                            <th className="px-3 py-2 font-medium w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {formData.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        placeholder="品項型號"
                                                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary px-1"
                                                        value={item.itemName}
                                                        onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Old SN"
                                                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-stone-400 px-1 text-stone-600 dark:text-stone-400"
                                                        value={item.oldSn}
                                                        onChange={(e) => handleItemChange(idx, "oldSn", e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        placeholder="New SN"
                                                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary px-1 font-mono text-primary"
                                                        value={item.newSn}
                                                        onChange={(e) => handleItemChange(idx, "newSn", e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-stone-300 hover:text-red-500 transition-colors"
                                                        title="刪除"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Row 5: Photos (New) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-stone-500">維修相片</label>
                            {event.photos && event.photos.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {event.photos.map((photo, i) => (
                                        <button
                                            key={photo.id || i}
                                            onClick={() => setSelectedPhoto(photo)}
                                            className="group relative aspect-square w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            {photo.url ? (
                                                <img
                                                    src={photo.url}
                                                    alt={photo.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center p-2 text-xs text-stone-400 text-center break-words">
                                                    {photo.name}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                                                <span className="material-symbols-outlined text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100">
                                                    zoom_in
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center text-xs text-stone-400 dark:border-stone-800 dark:bg-stone-900/50">
                                    無維修相片
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                        {/* Delete Button (Only for Verified by request, but logically could be for all. Request said "出料明細｜已入帳｜詳細資料彈窗") */}
                        {!isPending && onDelete ? (
                            deleteCount > 0 ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDeleteClick}
                                        className="rounded-lg px-4 py-2 text-sm font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    >
                                        {deleteCount === 2 ? "確定刪除 (3/3)" : "確定刪除?"}
                                    </button>
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                                    >
                                        返回
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDeleteClick}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                    刪除
                                </button>
                            )
                        ) : (
                            <div></div> // Spacer
                        )}

                        {/* Main Actions */}
                        <div className="flex gap-2">
                            {/* Only show Verify button if Pending */}
                            {isPending && (
                                <button
                                    onClick={handleVerifyClick}
                                    disabled={derivedStatus !== "Ready"}
                                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold shadow-sm transition-all
                                ${derivedStatus === "Ready"
                                            ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200"
                                            : "bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-stone-800"
                                        }
                            `}
                                >
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    入帳核許
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveClick}
                                className="rounded-lg bg-stone-800 px-6 py-2 text-sm font-medium text-white hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 shadow-md hover:shadow-lg transition-all"
                            >
                                儲存更新
                            </button>
                        </div>
                    </div>
                </div>
                <style jsx>{`
            .input-base {
                @apply h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-900;
            }
            .input-edit {
                @apply w-full rounded-lg border border-primary bg-white px-3 py-2 text-sm outline-none ring-2 ring-primary/20 dark:bg-stone-800 dark:text-white;
            }
        `}</style>
            </div>

            {/* Lightbox Overlay */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    <div className="relative max-h-full max-w-full overflow-hidden rounded-lg" onClick={(e) => e.stopPropagation()}>
                        {selectedPhoto.url ? (
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.name}
                                className="max-h-[90vh] max-w-[90vw] object-contain"
                            />
                        ) : (
                            <div className="bg-white p-8 rounded-lg text-center">
                                <p className="text-stone-900 font-bold mb-2">無法預覽圖片</p>
                                <p className="text-stone-500 text-sm">{selectedPhoto.name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
