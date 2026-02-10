"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TabGroupInventory from "../../../components/inventory/NorthTabGroupInventory";
import TabGroupOutbound from "../../../components/inventory/NorthTabGroupOutbound";
import InventoryActions from "../../../components/inventory/InventoryActions";
import { useReport, OutboundEvent, EventItem } from "@/app/providers";
import { InventoryItem, InboundEvent, HistorySnapshot, InboundItem, SEPickupRecord } from "@/components/inventory/types";
import NorthTabPickup from "@/components/inventory/NorthTabPickup";

// Re-export types for compatibility if needed
export type { OutboundEvent, EventItem };
export type { InboundEvent, InventoryItem };

const INITIAL_GENERAL_INVENTORY: InventoryItem[] = [
    { model: "PV Cable 4mm", stock: 0, inMonth: 0 },
    { model: "白鐵束帶(4.6x300mm)", stock: 0, inMonth: 0 },
    { model: "MC4防塵塞-母", stock: 0, inMonth: 0 },
    { model: "MC4防塵塞-公", stock: 0, inMonth: 0 },
    { model: "白鐵無控箱", stock: 0, inMonth: 0 },
    { model: "Router(單孔)", stock: 0, inMonth: 0 },
    { model: "PVC_22mm", stock: 0, inMonth: 0 },
    { model: "PVC_14mm", stock: 0, inMonth: 0 },
    { model: "PVC_8mm", stock: 0, inMonth: 0 },
    { model: "2\"蓋接", stock: 0, inMonth: 0 },
    { model: "鋁線槽蓋100*100", stock: 0, inMonth: 0 },
    { model: "鋁線槽蓋200*100", stock: 0, inMonth: 0 },
];

const INITIAL_SE_INVENTORY: InventoryItem[] = [
    { model: "SE3000H-RW000BEN4備機", stock: 0, inMonth: 0 },
    { model: "SE3000H-TW000BEN4備機", stock: 0, inMonth: 0 },
    { model: "SE5000H-RW000BEN4備機", stock: 0, inMonth: 0 },
    { model: "SE5000H-RW000BEN4", stock: 0, inMonth: 0 },
    { model: "SESUK-RW00INNN4", stock: 0, inMonth: 0 },
    { model: "SESUK-RW00INNN4副機備機", stock: 0, inMonth: 0 },
    { model: "SE82.8K-RW0P0BNY4", stock: 0, inMonth: 0 },
    { model: "S440-1GRAM4MRM-NA02", stock: 0, inMonth: 0 },
    { model: "P401I-5RM4MRM", stock: 0, inMonth: 0 },
    { model: "P500-5RM4MRM", stock: 0, inMonth: 0 },
    { model: "P701-4RMLMRL", stock: 0, inMonth: 0 },
    { model: "P801-4RMLMRY", stock: 0, inMonth: 0 },
    { model: "P850-4RMLMRY", stock: 0, inMonth: 0 },
    { model: "SE1000-GSM02-B", stock: 0, inMonth: 0 },
    { model: "S1000", stock: 0, inMonth: 0 },
    { model: "SE4000H", stock: 0, inMonth: 0 },
    { model: "R800", stock: 0, inMonth: 0 },
];

export default function NorthInventoryPage() {
    const { outboundEvents: providerOutboundEvents, setOutboundEvents: setProviderOutboundEvents } = useReport(); // Renamed to avoid partial conflict if needed, though we use local state mostly
    const [activeTab, setActiveTab] = useState<string>("inventory"); // inventory | outbound
    const [isEditMode, setIsEditMode] = useState(false);

    // Persistence Helper
    const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
        const [state, setState] = useState<T>(() => {
            if (typeof window === "undefined") return initialValue;
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                console.warn(`Error reading localStorage key "${key}":`, error);
                return initialValue;
            }
        });

        useEffect(() => {
            if (typeof window !== "undefined") {
                try {
                    window.localStorage.setItem(key, JSON.stringify(state));
                } catch (error) {
                    console.warn(`Error writing localStorage key "${key}":`, error);
                }
            }
        }, [key, state]);

        return [state, setState];
    };

    const STORAGE_KEY = "yjob.inventory.north.v1";

    // Combined State for Persistence
    type InventoryState = {
        seInventory: InventoryItem[];
        generalInventory: InventoryItem[];
        seProvidedInventory: InventoryItem[]; // New Category
        sePickupRecords: SEPickupRecord[]; // New State
        inboundEvents: InboundEvent[];
        outboundEvents: OutboundEvent[];
        inventoryHistory: HistorySnapshot[];
    };

    const INITIAL_STATE: InventoryState = {
        seInventory: INITIAL_SE_INVENTORY,
        generalInventory: INITIAL_GENERAL_INVENTORY,
        seProvidedInventory: [], // Default Empty
        sePickupRecords: [],
        inboundEvents: [],
        outboundEvents: [],
        inventoryHistory: []
    };


    const [persistedState, setPersistedState] = useLocalStorage<InventoryState>(STORAGE_KEY, INITIAL_STATE);

    // Derived State Setters (to maintain compatible API with existing code)
    const seInventory = persistedState.seInventory;
    const setSeInventory = (value: React.SetStateAction<InventoryItem[]>) => {
        setPersistedState(prev => ({
            ...prev,
            seInventory: typeof value === 'function' ? value(prev.seInventory) : value
        }));
    };

    const generalInventory = persistedState.generalInventory;
    const setGeneralInventory = (value: React.SetStateAction<InventoryItem[]>) => {
        setPersistedState(prev => ({
            ...prev,
            generalInventory: typeof value === 'function' ? value(prev.generalInventory) : value
        }));
    };

    const inboundEvents = persistedState.inboundEvents;
    const setInboundEvents = (value: React.SetStateAction<InboundEvent[]>) => {
        setPersistedState(prev => ({
            ...prev,
            inboundEvents: typeof value === 'function' ? value(prev.inboundEvents) : value
        }));
    };

    const outboundEvents = persistedState.outboundEvents;
    const setOutboundEvents = (value: React.SetStateAction<OutboundEvent[]>) => {
        setPersistedState(prev => ({
            ...prev,
            outboundEvents: typeof value === 'function' ? value(prev.outboundEvents) : value
        }));
    };

    const inventoryHistory = persistedState.inventoryHistory;
    const setInventoryHistory = (value: React.SetStateAction<HistorySnapshot[]>) => {
        setPersistedState(prev => ({
            ...prev,
            inventoryHistory: typeof value === 'function' ? value(prev.inventoryHistory) : value
        }));
    };


    // Pickup Records Helper
    const sePickupRecords = persistedState.sePickupRecords || [];
    const setSePickupRecords = (value: React.SetStateAction<SEPickupRecord[]>) => {
        setPersistedState(prev => ({
            ...prev,
            sePickupRecords: typeof value === 'function' ? value(prev.sePickupRecords || []) : value
        }));
    };

    const setSeProvidedInventory = (value: React.SetStateAction<InventoryItem[]>) => {
        setPersistedState(prev => ({
            ...prev,
            seProvidedInventory: typeof value === 'function' ? value(prev.seProvidedInventory || []) : value
        }));
    };

    // Tabs Configuration
    const tabs = [
        { id: "inventory", label: "庫存" },
        { id: "outbound", label: "出料明細" },
        { id: "pickup", label: "SE倉庫自取" },
    ];

    // Helpers
    const isSeSource = (source: string) => ["中辦移轉", "南辦移轉", "SE寄送", "SE倉庫自取"].includes(source);

    // Dynamic Calculation Helpers
    // Now supports 'category' priority
    const calculateStats = (items: InventoryItem[], inbound: InboundEvent[], outbound: OutboundEvent[], targetCategory: "se" | "general" | "se_provided") => {
        return items.map(item => {
            // Inbound: Verified AND !Archived
            const inCount = inbound
                .filter(e => e.status === "Verified" && !e.archived)
                .filter(e => {
                    // 1. If category exists, use it (Strict Mode)
                    if (e.category) {
                        return e.category === targetCategory;
                    }
                    // 2. Fallback to Source Logic (Backward Compatibility)
                    // For "se_provided", there was no old logic mapping to it, so it relies on new category.
                    // Old logic: isSeSource maps to SE Inventory.
                    if (targetCategory === "se") return isSeSource(e.source);
                    if (targetCategory === "general") return !isSeSource(e.source);
                    return false; // se_provided has no fallback
                })
                .reduce((sum, e) => sum + e.items.filter((i: InboundItem) => i.itemName === item.model).reduce((s, i: InboundItem) => s + i.quantity, 0), 0);

            // Outbound: Verified AND !Archived
            // Filter by Source based on Target Category
            const usedCount = outbound
                .filter(e => e.status === "Verified" && !e.archived)
                .filter(e => {
                    const src = e.source || "公司庫存";
                    if (targetCategory === "se_provided") {
                        return src === "SE提供";
                    }
                    if (targetCategory === "general") {
                        return src !== "SE提供"; // Includes "公司庫存", "案場餘料"
                    }
                    // For "se" (Main Solaredge Inventory), we might not have outbound logic yet, 
                    // or it follows a different rule. 
                    // Assuming records don't touch "se" main inventory for now unless specified.
                    return false;
                })
                .reduce((sum, e) => sum + e.items.filter((i: EventItem) => i.itemName === item.model).length, 0);

            return {
                ...item,
                inMonth: inCount,
                usedMonth: usedCount,
                leftMonth: item.stock + inCount - usedCount
            };
        });
    };

    // Verification Logic (Updated: Removed Stock Modification)
    const handleVerifyInbound = (verifiedEvent: InboundEvent) => {
        // Prevent double verification
        const currentEvent = inboundEvents.find(e => e.id === verifiedEvent.id);
        if (currentEvent?.status === "Verified") {
            console.warn("Event already verified.");
            return;
        }

        // 1. Update Inbound Events Status
        setInboundEvents(prev => prev.map(e => {
            if (e.id === verifiedEvent.id) {
                return {
                    ...e,
                    ...verifiedEvent,
                    status: "Verified",
                };
            }
            return e;
        }));

        // 2. Ensure Items Exist (Split Logic)
        const updateInventory = (setter: (value: React.SetStateAction<InventoryItem[]>) => void) => {
            setter(prev => {
                const newInventory = prev.map(item => ({ ...item }));
                verifiedEvent.items.forEach(inboundItem => {
                    const targetName = inboundItem.itemName.trim();
                    const existingItemIndex = newInventory.findIndex(i => i.model === targetName);

                    if (existingItemIndex === -1) {
                        newInventory.push({
                            model: targetName,
                            stock: 0,
                            inMonth: 0,
                            usedMonth: 0,
                            leftMonth: 0,
                        });
                    }
                });
                return newInventory;
            });
        };

        // Determine Target Inventory
        if (verifiedEvent.category) {
            if (verifiedEvent.category === "se") updateInventory(setSeInventory);
            else if (verifiedEvent.category === "general") updateInventory(setGeneralInventory);
            else if (verifiedEvent.category === "se_provided") updateInventory(setSeProvidedInventory);
        } else {
            // Fallback
            if (isSeSource(verifiedEvent.source)) updateInventory(setSeInventory);
            else updateInventory(setGeneralInventory);
        }
    };

    // Return Logic (Updated: Removed Stock Modification)
    const handleReturnInbound = (event: InboundEvent) => {
        if (event.status !== "Verified") return;
        setInboundEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: "Pending" } : e));
        // Stock is not modified directly anymore. Dynamic InCount will decrease.
    };

    const handleArchive = (month: string) => {
        // 1. Create Snapshot with Calculated Values
        const seStats = calculateStats(seInventory, inboundEvents, outboundEvents, "se");
        const generalStats = calculateStats(generalInventory, inboundEvents, outboundEvents, "general");
        const seProvidedStats = calculateStats(persistedState.seProvidedInventory || [], inboundEvents, outboundEvents, "se_provided");

        const allItems = [...seStats, ...generalStats, ...seProvidedStats];

        const snapshot: HistorySnapshot = {
            month: month,
            sealedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
            items: allItems
        };

        // 2. Add to History (Keep max 3, Overwrite same month)
        setInventoryHistory(prev => {
            // Remove same month if exists (Overwrite strategy)
            const filtered = prev.filter(h => h.month !== month);

            // Add new snapshot
            const newHistory = [snapshot, ...filtered];

            // Sort by Month Descending (Ensure "Recent" 3)
            newHistory.sort((a, b) => b.month.localeCompare(a.month));

            // Keep Max 3
            return newHistory.slice(0, 3);
        });

        // 3. Mark Events as Archived
        setInboundEvents(prev => prev.map(e => e.status === "Verified" && !e.archived ? { ...e, archived: true } : e));
        setOutboundEvents(prev => prev.map(e => e.status === "Verified" && !e.archived ? { ...e, archived: true } : e));

        // 4. Update Stock for Next Month (Stock = LeftMonth)
        setSeInventory(prev => prev.map(item => {
            const stat = seStats.find(s => s.model === item.model);
            return { ...item, stock: stat ? stat.leftMonth || 0 : 0 };
        }));
        setGeneralInventory(prev => prev.map(item => {
            const stat = generalStats.find(s => s.model === item.model);
            return { ...item, stock: stat ? stat.leftMonth || 0 : 0 };
        }));
        setPersistedState(prev => ({
            ...prev,
            seProvidedInventory: (prev.seProvidedInventory || []).map(item => {
                const stat = seProvidedStats.find(s => s.model === item.model);
                return { ...item, stock: stat ? stat.leftMonth || 0 : 0 };
            })
        }));
    };

    const handleStockUpdate = (model: string, newStock: number) => {
        setSeInventory(prev => prev.map(item => item.model === model ? { ...item, stock: newStock } : item));
        setGeneralInventory(prev => prev.map(item => item.model === model ? { ...item, stock: newStock } : item));
        setPersistedState(prev => ({
            ...prev,
            seProvidedInventory: (prev.seProvidedInventory || []).map(item => item.model === model ? { ...item, stock: newStock } : item)
        }));
    };

    const handleToggleEditMode = (entering: boolean) => {
        if (entering) {
            // Check if there are unarchived verified events
            const hasVerified = [...inboundEvents, ...outboundEvents].some(e => e.status === "Verified" && !e.archived);

            if (hasVerified) {
                const confirm = window.confirm("是否要帶入上月餘料（若有封存）並將本月單據歸檔？\n\n按「確定」：帶入上月餘料 + 歸檔目前單據（重置本月入庫/使用）\n按「取消」：僅開啟編輯模式（維持目前庫存數值）");

                if (confirm) {
                    // Default to last snapshot or 0
                    const lastSnapshot = inventoryHistory[0];
                    if (lastSnapshot) {
                        setSeInventory(prev => prev.map(item => {
                            const snapItem = lastSnapshot.items.find(i => i.model === item.model);
                            return { ...item, stock: snapItem ? (snapItem.leftMonth || 0) : 0 };
                        }));
                        setGeneralInventory(prev => prev.map(item => {
                            const snapItem = lastSnapshot.items.find(i => i.model === item.model);
                            return { ...item, stock: snapItem ? (snapItem.leftMonth || 0) : 0 };
                        }));
                    }

                    // Archive events to reset counts
                    setInboundEvents(prev => prev.map(e => (!e.archived && e.status === "Verified") ? { ...e, archived: true } : e));
                    setOutboundEvents(prev => prev.map(e => (!e.archived && e.status === "Verified") ? { ...e, archived: true } : e));
                }
            }
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
        }
    };

    const handleReturnOutbound = (id: string) => {
        setOutboundEvents(prev => prev.map(e => {
            if (e.id === id) {
                return { ...e, status: "Ready", verifyUser: undefined, verifyDate: undefined };
            }
            return e;
        }));
    };

    const handleDeleteOutbound = (id: string) => {
        setOutboundEvents(prev => prev.filter(e => e.id !== id));
    };

    const handleDeleteInbound = (id: string) => {
        setInboundEvents(prev => prev.filter(e => e.id !== id));
    };

    // --- Pickup Handlers ---
    const handleAddPickupRecord = () => {
        const newRecord: SEPickupRecord = {
            id: crypto.randomUUID(),
            project: "新增案場",
            pickupMethod: "SE倉庫自取",
            pickupDate: new Date().toISOString().split('T')[0],
            note: ""
        };
        setSePickupRecords(prev => [newRecord, ...prev]);
    };

    const handleUpdatePickupRecord = (id: string, field: keyof SEPickupRecord, value: any) => {
        setSePickupRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleDeletePickupRecord = (id: string) => {
        setSePickupRecords(prev => prev.filter(r => r.id !== id));
    };

    // Verify Outbound Logic
    const handleVerifyOutbound = (id: string, updatedEvent: Partial<OutboundEvent>) => {
        const event = outboundEvents.find(e => e.id === id);
        if (!event) return;
        if (event.status === "Verified") {
            alert("此單據已入帳，請勿重複操作");
            return;
        }

        const confirmVerify = window.confirm("確認入帳？（將扣除庫存/計算使用量）");
        if (!confirmVerify) return;

        // 1. Update Status
        const newData = {
            ...updatedEvent,
            status: "Verified" as const,
            verifyDate: new Date().toISOString().split("T")[0],
            verifyUser: "系統"
        };

        setOutboundEvents(prev => prev.map(e => e.id === id ? { ...e, ...newData } : e));

        // 2. Ensure Items Exist in Inventory (Auto-create if missing)
        // Note: Actual deduction happens dynamically in calculateStats via the "Verified" status.
        // We only need to ensure the "Model" exists in the list so calculateStats can see it.
        const source = (updatedEvent.source || event.source || "公司庫存");
        const items = event.items || [];

        // Helper to check existence
        const exists = (model: string) => {
            return seInventory.some(i => i.model === model) ||
                generalInventory.some(i => i.model === model) ||
                (persistedState.seProvidedInventory || []).some(i => i.model === model);
        };

        // Group items by model to avoid repeated adds
        const uniqueModels = Array.from(new Set(items.map(i => i.itemName)));

        uniqueModels.forEach(model => {
            if (model && !exists(model)) {
                // Determine where to add
                // Rule: "SE提供" -> seProvided; Others -> general
                const newItem: InventoryItem = {
                    model: model,
                    stock: 0,
                    inMonth: 0,
                    usedMonth: 0,
                    leftMonth: 0 // Will auto-update to negative if used
                };

                if (source === "SE提供") {
                    setSeProvidedInventory(prev => [...prev, newItem]);
                } else {
                    // Default to General
                    setGeneralInventory(prev => [...prev, newItem]);
                }
            }
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
                <div className="flex items-center gap-2">
                    <Link
                        href="/inventory"
                        className="flex items-center justify-center rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                        北區庫存
                    </h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full flex flex-col gap-4">

                {/* Top-level Tabs */}
                <div className="w-full border-b border-stone-200 dark:border-stone-800">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === tab.id
                                    ? "text-primary"
                                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full">
                    {activeTab === "inventory" && (
                        <TabGroupInventory
                            outboundEvents={outboundEvents}
                            inventoryItems={generalInventory}
                            seInventoryItems={seInventory}
                            seProvidedInventoryItems={persistedState.seProvidedInventory || []}
                            inboundEvents={inboundEvents}
                            isEditMode={isEditMode}
                            onUpdateStock={handleStockUpdate}
                            onAddItem={(category, newItem) => {
                                if (category === "se") {
                                    setSeInventory(prev => [...prev, newItem]);
                                } else if (category === "general") {
                                    setGeneralInventory(prev => [...prev, newItem]);
                                } else if (category === "se_provided") {
                                    setPersistedState(prev => ({
                                        ...prev,
                                        seProvidedInventory: [...(prev.seProvidedInventory || []), newItem]
                                    }));
                                }
                            }}
                            onDeleteItem={(category, model) => {
                                if (category === "se") {
                                    setSeInventory(prev => prev.filter(i => i.model !== model));
                                } else if (category === "general") {
                                    setGeneralInventory(prev => prev.filter(i => i.model !== model));
                                } else if (category === "se_provided") {
                                    setPersistedState(prev => ({
                                        ...prev,
                                        seProvidedInventory: (prev.seProvidedInventory || []).filter(i => i.model !== model)
                                    }));
                                }
                            }}
                        />
                    )}
                    {activeTab === "outbound" && (
                        <TabGroupOutbound
                            events={outboundEvents}
                            setEvents={setOutboundEvents}
                            inboundEvents={inboundEvents}
                            setInboundEvents={setInboundEvents}
                            onVerifyInbound={handleVerifyInbound}
                            onVerifyOutbound={handleVerifyOutbound}  // Pass new handler
                            inventoryItems={generalInventory}
                            onReturnInbound={handleReturnInbound}
                            onReturnOutbound={handleReturnOutbound}
                            deleteEvent={handleDeleteOutbound}
                            onDeleteInbound={handleDeleteInbound}
                        />
                    )}
                    {activeTab === "pickup" && (
                        <NorthTabPickup
                            records={sePickupRecords}
                            onAdd={handleAddPickupRecord}
                            onUpdate={handleUpdatePickupRecord}
                            onDelete={handleDeletePickupRecord}
                        />
                    )}
                </div>

                {/* Footer Actions (Only for Inventory Tab) */}
                {activeTab === "inventory" && (
                    <InventoryActions
                        currentMonth={new Date().toISOString().slice(0, 7)}
                        onToggleEditMode={handleToggleEditMode}
                        isEditMode={isEditMode}
                        onArchive={handleArchive}
                        inventoryHistory={inventoryHistory}
                    />
                )}
            </main>
        </div>
    );
}
