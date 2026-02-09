"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { OutboundEvent } from "@/app/providers";
import { InventoryItem, InboundEvent, InboundItem } from "@/components/inventory/types";

type Props = {
    outboundEvents: OutboundEvent[];
    inventoryItems: InventoryItem[];
    inboundEvents: InboundEvent[];
    isEditMode?: boolean; // Optional to prevent breaking if parent not updated immediately
    onUpdateStock?: (model: string, newStock: number) => void;
    onAddItem?: (item: InventoryItem) => void;
    onDeleteItem?: (model: string) => void;
};

export default function Tab1SEInventory({ outboundEvents, inventoryItems, inboundEvents, isEditMode, onUpdateStock, onAddItem, onDeleteItem }: Props) {
    const isSeSource = (source: string) => ["中辦移轉", "南辦移轉", "SE寄送", "SE倉庫自取"].includes(source);

    // Editing State
    const [editingModel, setEditingModel] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Add Item Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItemModel, setNewItemModel] = useState("");
    const [newItemStock, setNewItemStock] = useState("0");

    useEffect(() => {
        if (editingModel && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingModel]);

    // Calculate usage from verified outbound events
    const inventoryData = useMemo(() => {
        return inventoryItems.map((invItem) => {
            let usedCount = 0;
            let inCount = 0;

            // Calculate Used (Outbound)
            // Iterate over verified events that are NOT archived
            outboundEvents
                .filter((e) => e.status === "Verified" && !e.archived && ["公司庫存", "SE提供", "案場餘料"].includes(e.source || "公司庫存"))
                .forEach((e) => {
                    e.items.forEach(item => {
                        if (item.itemName === invItem.model) {
                            usedCount++;
                        }
                    });
                });

            // Calculate In (Inbound)
            // Iterate over verified events that are NOT archived AND are from SE sources
            inboundEvents
                .filter(e => e.status === "Verified" && !e.archived && isSeSource(e.source))
                .forEach(e => {
                    e.items.forEach(item => {
                        if (item.itemName === invItem.model) {
                            inCount += item.quantity;
                        }
                    });
                });

            return {
                ...invItem,
                inMonth: inCount,
                usedMonth: usedCount,
                leftMonth: invItem.stock + inCount - usedCount, // Simplified logic: Stock + In - Used
            };
        });
    }, [outboundEvents, inventoryItems, inboundEvents]);

    const handleStartEdit = (item: InventoryItem) => {
        if (!isEditMode) return;
        setEditingModel(item.model);
        setEditValue(item.stock.toString());
    };

    const handleSaveEdit = () => {
        if (!editingModel || !onUpdateStock) return;
        const val = parseInt(editValue);
        if (!isNaN(val) && val >= 0) {
            onUpdateStock(editingModel, val);
        }
        setEditingModel(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveEdit();
        } else if (e.key === "Escape") {
            setEditingModel(null);
        }
    };

    // Add Item Logic
    const handleConfirmAdd = () => {
        if (!newItemModel.trim()) {
            alert("請輸入型號/品名");
            return;
        }
        if (!onAddItem) return;

        // Check duplicate
        if (inventoryItems.some(i => i.model === newItemModel.trim())) {
            alert("此型號已存在");
            return;
        }

        const stockVal = parseInt(newItemStock);
        if (isNaN(stockVal) || stockVal < 0) {
            alert("初始庫存無效");
            return;
        }

        onAddItem({
            model: newItemModel.trim(),
            stock: stockVal,
            inMonth: 0
        });

        // Reset and Close
        setNewItemModel("");
        setNewItemStock("0");
        setIsAddModalOpen(false);
    };

    // Delete Item Logic
    const handleDelete = (model: string) => {
        if (!onDeleteItem) return;
        const confirm = window.confirm(`確定刪除此品項「${model}」？`);
        if (confirm) {
            onDeleteItem(model);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    新增品項
                </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-stone-50 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">型號/品名</th>
                                <th className="px-4 py-3 font-medium text-right w-32">
                                    {isEditMode ? (
                                        <div className="flex items-center justify-end gap-1 text-primary">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            初始庫存
                                        </div>
                                    ) : (
                                        "初始庫存"
                                    )}
                                </th>
                                <th className="px-4 py-3 font-medium text-right">本月入庫</th>
                                <th className="px-4 py-3 font-medium text-right text-amber-600 dark:text-amber-500">本月使用</th>
                                <th className="px-4 py-3 font-medium text-right text-green-600 dark:text-green-500">本月餘料</th>
                                <th className="px-4 py-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {inventoryData.map((item) => (
                                <tr key={item.model} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50">
                                    <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                                        {item.model}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right transition-colors ${isEditMode ? "cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800" : "text-stone-600 dark:text-stone-400"
                                            }`}
                                        onDoubleClick={() => handleStartEdit(item)}
                                    >
                                        {editingModel === item.model ? (
                                            <input
                                                ref={inputRef}
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={handleSaveEdit}
                                                onKeyDown={handleKeyDown}
                                                className="w-20 px-2 py-1 text-right text-sm border rounded focus:ring-2 focus:ring-primary/50 outline-none dark:bg-stone-800 dark:border-stone-700"
                                                min={0}
                                            />
                                        ) : (
                                            isEditMode ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-0.5">
                                                        {item.stock}
                                                    </span>
                                                    <span className="material-symbols-outlined text-xs text-stone-400">edit</span>
                                                </div>
                                            ) : (
                                                item.stock
                                            )
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-stone-600 dark:text-stone-400">
                                        {item.inMonth}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-amber-600 dark:text-amber-500">
                                        {item.usedMonth}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-500">
                                        {item.leftMonth}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(item.model)}
                                            className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900/20"
                                            title="刪除品項"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">新增 Solaredge 品項</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    型號 / 品名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newItemModel}
                                    onChange={(e) => setNewItemModel(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:ring-primary focus:border-primary outline-none dark:bg-stone-800 dark:border-stone-700"
                                    placeholder="例如：SE3000H"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    初始庫存 (期初)
                                </label>
                                <input
                                    type="number"
                                    value={newItemStock}
                                    onChange={(e) => setNewItemStock(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:ring-primary focus:border-primary outline-none dark:bg-stone-800 dark:border-stone-700"
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors dark:text-stone-400 dark:hover:bg-stone-800"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleConfirmAdd}
                                className="px-4 py-2 bg-stone-800 text-white hover:bg-stone-900 rounded-lg transition-colors dark:bg-stone-700 dark:hover:bg-stone-600 font-bold"
                            >
                                確定新增
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditMode && (
                <p className="text-xs text-primary text-center mt-2 font-bold animate-pulse">
                    * 提示：雙擊「初始庫存」欄位可直接修改數值
                </p>
            )}
            <p className="text-xs text-stone-400 text-center mt-1">
                * 「本月使用」統計自【出料明細】中已入帳且來源非餘料的項目
            </p>
        </div>
    );
}
