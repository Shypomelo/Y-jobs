"use client";

import { useState, useRef, useEffect } from "react";
import { SEPickupRecord } from "./types";

type Props = {
    records: SEPickupRecord[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof SEPickupRecord, value: any) => void;
    onDelete: (id: string) => void;
};

export default function NorthTabPickup({ records, onAdd, onUpdate, onDelete }: Props) {
    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<keyof SEPickupRecord | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => {
        if (editingId && editingField && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId, editingField]);

    const handleStartEdit = (record: SEPickupRecord, field: keyof SEPickupRecord) => {
        setEditingId(record.id);
        setEditingField(field);
        setEditValue(record[field]?.toString() || "");
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingField) return;

        onUpdate(editingId, editingField, editValue);

        setEditingId(null);
        setEditingField(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveEdit();
        } else if (e.key === "Escape") {
            setEditingId(null);
            setEditingField(null);
        }
    };

    const handleDeleteClick = (id: string, project: string) => {
        if (window.confirm(`確定刪除案名「${project}」的紀錄？`)) {
            onDelete(id);
        }
    };

    const renderCell = (record: SEPickupRecord, field: keyof SEPickupRecord, type: "text" | "date" | "select" = "text", options?: string[]) => {
        const isEditing = editingId === record.id && editingField === field;
        const value = record[field]?.toString() || "";

        if (isEditing) {
            if (type === "select" && options) {
                return (
                    <select
                        ref={inputRef as any}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary/50 outline-none dark:bg-stone-800 dark:border-stone-700"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            }
            return (
                <input
                    ref={inputRef as any}
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-primary/50 outline-none dark:bg-stone-800 dark:border-stone-700"
                />
            );
        }

        return (
            <div
                onDoubleClick={() => handleStartEdit(record, field)}
                className="w-full h-full min-h-[24px] cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 px-2 py-1 rounded transition-colors truncate"
            >
                {value || <span className="text-stone-300 dark:text-stone-600 text-xs italic">空</span>}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    新增一列
                </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-stone-50 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                            <tr>
                                <th className="px-4 py-3 font-medium w-40">案名 <span className="text-red-500">*</span></th>
                                <th className="px-4 py-3 font-medium w-32">原故障型號</th>
                                <th className="px-4 py-3 font-medium w-32">故障序號</th>
                                <th className="px-4 py-3 font-medium w-32">故障原因</th>
                                <th className="px-4 py-3 font-medium w-32">新物料序號</th>
                                <th className="px-4 py-3 font-medium w-32">收貨方式</th>
                                <th className="px-4 py-3 font-medium w-32">取料時間</th>
                                <th className="px-4 py-3 font-medium w-32">更換日期</th>
                                <th className="px-4 py-3 font-medium min-w-[150px]">備註事項</th>
                                <th className="px-4 py-3 font-medium w-16 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-stone-400">
                                        尚無自取紀錄，請點擊上方按鈕新增
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50 group">
                                        <td className="px-2 py-2">{renderCell(record, "project")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "originalModel")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "faultySerial")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "faultyReason")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "newSerial")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "pickupMethod", "select", ["SE倉庫自取", "其他"])}</td>
                                        <td className="px-2 py-2">{renderCell(record, "pickupDate", "date")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "replaceDate", "date")}</td>
                                        <td className="px-2 py-2">{renderCell(record, "note")}</td>
                                        <td className="px-2 py-2 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(record.id, record.project)}
                                                className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900/20"
                                                title="刪除紀錄"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-primary text-center mt-2 font-bold animate-pulse">
                * 提示：雙擊欄位可直接修改內容
            </p>
        </div>
    );
}
