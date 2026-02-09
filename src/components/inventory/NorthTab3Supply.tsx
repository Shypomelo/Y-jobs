"use client";

import { useState } from "react";
import { InventoryItem } from "./types";

type Props = {
    inventoryItems: InventoryItem[];
    onAddItem: (item: InventoryItem) => void;
    onDeleteItem: (model: string) => void;
};

export default function Tab3SupplyInventory({ inventoryItems, onAddItem, onDeleteItem }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemModel, setNewItemModel] = useState("");
    const [newItemStock, setNewItemStock] = useState<number>(0);

    const filteredItems = inventoryItems.filter(item =>
        item.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItemSubmit = () => {
        if (!newItemModel.trim()) {
            alert("請輸入型號/名稱");
            return;
        }
        if (inventoryItems.some(i => i.model === newItemModel)) {
            alert("該型號已存在");
            return;
        }

        onAddItem({
            model: newItemModel,
            stock: newItemStock || 0,
            inMonth: 0,
            usedMonth: 0,
            leftMonth: newItemStock || 0
        });

        setShowAddModal(false);
        setNewItemModel("");
        setNewItemStock(0);
    };

    const handleDeleteClick = (model: string) => {
        if (window.confirm(`確定要刪除「${model}」嗎？\n刪除後無法復原。`)) {
            onDeleteItem(model);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm dark:bg-stone-900 dark:border-stone-800">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
                    <input
                        type="text"
                        placeholder="搜尋 Solaredge 提供物料..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-stone-950 dark:border-stone-800"
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm font-medium"
                >
                    <span className="material-symbols-outlined">add</span>
                    新增品項
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                        <tr>
                            <th className="px-6 py-3 font-medium">型號 / 名稱</th>
                            <th className="px-6 py-3 font-medium text-right">目前庫存</th>
                            <th className="px-6 py-3 font-medium text-right">本月入庫</th>
                            <th className="px-6 py-3 font-medium text-right">本月領用</th>
                            <th className="px-6 py-3 font-medium text-right">小計</th>
                            <th className="px-6 py-3 font-medium text-right w-20">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-stone-400">
                                    沒有符合的項目
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.model} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50 transition-colors group">
                                    <td className="px-6 py-3 font-medium text-stone-700 dark:text-stone-200">
                                        {item.model}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className="font-mono text-stone-600 dark:text-stone-400">{item.stock}</span>
                                    </td>
                                    <td className="px-6 py-3 text-right text-green-600 dark:text-green-400">
                                        +{item.inMonth}
                                    </td>
                                    <td className="px-6 py-3 text-right text-red-600 dark:text-red-400">
                                        -{item.usedMonth}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-primary">
                                        {item.leftMonth}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDeleteClick(item.model)}
                                            className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                                            title="刪除項目"
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

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">新增 Solaredge 提供物料</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-500 mb-1">型號 / 名稱 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newItemModel}
                                    onChange={e => setNewItemModel(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none dark:bg-stone-800 dark:border-stone-700"
                                    placeholder="例如：新型變流器..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-500 mb-1">初始庫存 (預設 0)</label>
                                <input
                                    type="number"
                                    value={newItemStock}
                                    onChange={e => setNewItemStock(Number(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none dark:bg-stone-800 dark:border-stone-700"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors dark:hover:bg-stone-800"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddItemSubmit}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm"
                            >
                                確定新增
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
