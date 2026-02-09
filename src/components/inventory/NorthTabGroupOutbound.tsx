"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { OutboundEvent } from "@/app/providers";
import { InboundEvent, InventoryItem } from "@/components/inventory/types";
import OutboundModal from "@/components/inventory/OutboundModal";
import InboundModal from "@/components/inventory/InboundModal";

type Props = {
    events: OutboundEvent[];
    setEvents: Dispatch<SetStateAction<OutboundEvent[]>>;
    deleteEvent?: (id: string) => void;
    // New Props for Inbound
    inboundEvents: InboundEvent[];
    setInboundEvents: Dispatch<SetStateAction<InboundEvent[]>>;
    onVerifyInbound: (event: InboundEvent) => void;
    inventoryItems: InventoryItem[];
    // Return Handlers
    onReturnInbound: (event: InboundEvent) => void;
    onReturnOutbound: (id: string) => void;
    onDeleteInbound: (id: string) => void;
};

export default function TabGroupOutbound({
    events,
    setEvents,
    deleteEvent,
    inboundEvents,
    setInboundEvents,
    onVerifyInbound,
    inventoryItems,
    onReturnInbound,
    onReturnOutbound,
    onDeleteInbound
}: Props) {
    // Tabs: "outbound" (出庫), "inbound" (入庫), "verified_outbound" (已入帳-出庫), "verified_inbound" (已入帳-入庫)
    const [subTab, setSubTab] = useState<"outbound" | "inbound" | "verified_outbound" | "verified_inbound">("outbound");

    // ... (existing state)

    // ... (existing handlers)



    // Selection state
    const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null);
    const [selectedInboundId, setSelectedInboundId] = useState<string | null>(null);
    const [isAddInboundMode, setIsAddInboundMode] = useState(false);

    // Filtered Lists
    const pendingOutbound = events.filter((e) => e.status !== "Verified");
    const verifiedOutbound = events.filter((e) => e.status === "Verified");

    const pendingInbound = inboundEvents.filter((e) => e.status !== "Verified");
    const verifiedInbound = inboundEvents.filter((e) => e.status === "Verified");

    // Handlers
    const closeDetail = () => {
        setSelectedOutboundId(null);
        setSelectedInboundId(null);
        setIsAddInboundMode(false);
    };

    // Outbound Handlers
    const handleSaveOutbound = (id: string, updatedEvent: Partial<OutboundEvent>) => {
        setEvents((prev) =>
            prev.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
        );
        closeDetail();
    };

    const handleVerifyOutbound = (id: string, updatedEvent: Partial<OutboundEvent>) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== id) return e;
                return {
                    ...e,
                    ...updatedEvent,
                    status: "Verified",
                    verifyDate: new Date().toISOString().split("T")[0],
                    verifyUser: "系統",
                };
            })
        );
        closeDetail();
    };

    // Inbound Handlers
    const handleSaveInbound = (event: InboundEvent) => {
        if (isAddInboundMode) {
            setInboundEvents(prev => [...prev, event]);
        } else {
            setInboundEvents(prev => prev.map(e => e.id === event.id ? event : e));
        }
        closeDetail();
    };

    const handleVerifyInboundWrapper = (event: InboundEvent) => {
        onVerifyInbound(event);
        closeDetail();
    };

    // Derived Targets
    const targetOutbound = events.find((e) => e.id === selectedOutboundId);
    const targetInbound = inboundEvents.find((e) => e.id === selectedInboundId);

    return (
        <div className="flex flex-col gap-4">
            {/* Sub-Tabs (Pill Style) */}
            <div className="flex flex-wrap gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
                <button
                    onClick={() => setSubTab("outbound")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === "outbound"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-white"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    出庫 ({pendingOutbound.length})
                </button>
                <button
                    onClick={() => setSubTab("inbound")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === "inbound"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-white"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    入庫 ({pendingInbound.length})
                </button>
                <div className="w-px h-6 bg-stone-300 dark:bg-stone-700 mx-1 self-center" />
                <button
                    onClick={() => setSubTab("verified_outbound")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === "verified_outbound"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-white"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    已入帳－出庫 ({verifiedOutbound.length})
                </button>
                <button
                    onClick={() => setSubTab("verified_inbound")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${subTab === "verified_inbound"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-white"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    已入帳－入庫 ({verifiedInbound.length})
                </button>
            </div>

            {/* Inbound Action Bar */}
            {subTab === "inbound" && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsAddInboundMode(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stone-200 text-stone-800 text-sm font-bold rounded-lg shadow-sm hover:bg-stone-300 transition-all dark:bg-stone-700 dark:text-white dark:hover:bg-stone-600"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        新增入庫
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="mt-2 space-y-8">
                {subTab === "outbound" && (
                    <OutboundTable
                        events={pendingOutbound}
                        onDetailClick={setSelectedOutboundId}
                        emptyMessage="無出庫紀錄"
                    />
                )}
                {subTab === "inbound" && (
                    <InboundTable
                        events={pendingInbound}
                        onDetailClick={setSelectedInboundId}
                        emptyMessage="無北區入庫紀錄"
                    />
                )}
                {subTab === "verified_outbound" && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wider pl-1 border-l-4 border-blue-500">已出庫紀錄</h4>
                        <OutboundTable
                            events={verifiedOutbound}
                            onDetailClick={setSelectedOutboundId}
                            emptyMessage="無已入帳出庫紀錄"
                            onReturn={onReturnOutbound} // Pass Return Handler
                        />
                    </div>
                )}
                {subTab === "verified_inbound" && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wider pl-1 border-l-4 border-amber-500">已入庫紀錄</h4>
                        <InboundTable
                            events={verifiedInbound}
                            onDetailClick={() => { }} // Readonly
                            emptyMessage="無已入庫紀錄"
                            readonly
                            onReturn={onReturnInbound} // Pass Return Handler
                        />
                    </div>
                )}
            </div>

            {/* Outbound Modal */}
            {targetOutbound && (
                <OutboundModal
                    event={targetOutbound}
                    onClose={closeDetail}
                    onSave={handleSaveOutbound}
                    onVerify={handleVerifyOutbound}
                    onDelete={deleteEvent}
                />
            )}

            {/* Inbound Modal */}
            {(isAddInboundMode || targetInbound) && (
                <InboundModal
                    event={targetInbound}
                    inventoryItems={inventoryItems}
                    onClose={closeDetail}
                    onSave={handleSaveInbound}
                    onVerify={handleVerifyInboundWrapper}
                    onDelete={onDeleteInbound}
                />
            )}
        </div>
    );
}

// --- Components ---

function OutboundTable({
    events,
    onDetailClick,
    emptyMessage,
    onReturn
}: {
    events: OutboundEvent[];
    onDetailClick: (id: string) => void;
    emptyMessage: string;
    onReturn?: (id: string) => void;
}) {
    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">處理人員</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">案場名稱</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">來源</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">更換品項</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">維修相片</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">完成時間</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            events.map((item) => (
                                <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400 max-w-[150px] truncate" title={item.handlers?.join("、") || "-"}>
                                        {item.handlers?.join("、") || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-stone-800 dark:text-stone-200 font-medium">
                                        {item.site}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
                                            {item.source || "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        {item.items.length > 1 ? `多品項 (${item.items.length})` : (item.items[0]?.itemName || "-")}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        {item.photos && item.photos.length > 0 ? (
                                            <span className="text-xs text-stone-500">{item.photos.length} 張相片</span>
                                        ) : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400 font-mono text-xs">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        {onReturn ? (
                                            <button
                                                onClick={() => onReturn(item.id)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                                            >
                                                退回
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onDetailClick(item.id)}
                                                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                            >
                                                詳細資料
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InboundTable({
    events,
    onDetailClick,
    emptyMessage,
    readonly,
    onReturn
}: {
    events: InboundEvent[];
    onDetailClick: (id: string) => void;
    emptyMessage: string;
    readonly?: boolean;
    onReturn?: (event: InboundEvent) => void;
}) {
    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">來源</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">入庫人員</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">入庫品項明細</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">案場名稱</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">入庫日期</th>
                            <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">備註</th>
                            {!readonly && <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">操作</th>}
                            {readonly && onReturn && <th className="px-6 py-3 font-semibold text-stone-700 dark:text-stone-300">操作</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={readonly ? 5 : 6} className="px-6 py-12 text-center text-stone-400 dark:text-stone-600">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            events.map((item) => (
                                <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50">
                                            {item.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        {item.inboundPerson || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-stone-800 dark:text-stone-200 font-medium">
                                        <div className="flex flex-col gap-1">
                                            {item.items.map((i, idx) => (
                                                <span key={i.id} className="text-sm">
                                                    {i.itemName} <span className="text-stone-400 ml-1">x{i.quantity}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                        {item.siteName || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400 font-mono text-xs">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4 text-stone-500 dark:text-stone-500 text-xs max-w-[200px] truncate" title={item.note}>
                                        {item.note || "-"}
                                    </td>
                                    {!readonly && (
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onDetailClick(item.id)}
                                                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                            >
                                                詳細資料
                                            </button>
                                        </td>
                                    )}
                                    {readonly && onReturn && (
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => onReturn(item)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                                            >
                                                退回
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
