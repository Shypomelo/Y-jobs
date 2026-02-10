"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Report {
    id: string;
    location?: string;
    site: string;
    category: string;
    sourcePlatform: string;
    address: string;
    contact: string;
    description: string;
    note: string;
    createdAt: string;
    // History fields
    reviewResult?: "成立" | "未達標準" | "無異常";
    reviewedAt?: string;
    attachment?: string; // Filename of the attachment
    // Journal Link fields
    reporter?: string;
    fingerprint?: string;
    remark?: string;
    sourceReportId?: string;
    region?: string;
    repairCategory?: string;
    contactInfo?: string;
}

export interface JournalItem {
    id: string;
    status: "待處理" | "處理中" | "觀察中" | "已完成";
    location?: string;
    siteName: string;
    source: string;
    description: string;
    processStatus: string;
    handler: "柚子" | "QQ" | "俊傑" | "竹哥" | "";
    completedAt: string; // YYYY/MM/DD or empty
    isClosed: boolean;
    createdDateISO: string; // YYYY-MM-DD
    // Added fields
    remark: string;
    reporter: string;
    fingerprint: string;
    sourceReportId?: string; // linked task ID
    region: string;
    repairCategory?: string;
    contactInfo?: string;
}

export interface PartPair {
    id: string;
    oldModel: string;
    oldSerial: string;
    newModel: string;
    newSerial: string;
}

// Export PartPair as RecordPair for compatibility if needed, or just export PartPair
export type RecordPair = PartPair;

export interface PhotoItem {
    id: string;
    name: string;
    url?: string;
}

// --- Outbound Types (Lifted from North Inventory) ---
export type EventItem = {
    itemName: string;
    oldSn: string;
    newSn: string;
};

export type OutboundEvent = {
    id: string;
    site: string; // 案名
    date: string; // 使用日期
    source: string; // "公司庫存" | "SE提供" | "案場餘料"
    status: "Missing" | "Ready" | "Verified";
    items: EventItem[]; // 多品項明細
    verifyDate?: string;
    verifyUser?: string;
    // New Fields for Sync
    sourceRefId?: string; // Record ID
    handlers?: string[];
    photos?: PhotoItem[];
    archived?: boolean; // New Field for Archive logic
    note?: string; // New Field for Remarks
};

export interface RecordItem {
    id: string;
    handlers: string[]; // Changed from handler: string
    location: string; // New field
    siteName: string;
    workType: "優化器" | "逆變器" | "線管路" | "監控" | "房屋";
    pairs: PartPair[];
    photos: PhotoItem[]; // Changed from string[]
    createdAtDate: string;
    completedDate: string; // New field
    region?: "北區" | "中區" | "南區" | "未知";
}

export function getLocationKeyFromSiteName(siteName: string): string {
    return siteName.trim().substring(0, 4);
}

export function getRegionFromLocation(location: string): "北區" | "中區" | "南區" | "未知" {
    if (!location) return "未知";
    const north = ["基隆", "台北", "臺北", "新北", "桃園", "新竹", "宜蘭"];
    const central = ["苗栗", "台中", "臺中", "彰化", "南投"];
    const south = ["雲林", "嘉義", "台南", "臺南", "高雄", "屏東", "澎湖", "金門", "連江", "花蓮", "台東", "臺東"];

    for (const city of north) if (location.includes(city)) return "北區";
    for (const city of central) if (location.includes(city)) return "中區";
    for (const city of south) if (location.includes(city)) return "南區";

    return "未知";
    return "未知";
}

export function normalizeLocation(location: string): string {
    return location.replace(/\s+/g, "");
}

export function validateLocation4(location: string): boolean {
    const normalized = normalizeLocation(location);
    return normalized.length === 4;
}

interface ReportContextType {
    pendingReports: Report[];
    historyReports: Report[];
    journalOpenItems: JournalItem[];
    journalResolvedItems: JournalItem[];
    addPending: (report: Report) => void;
    reviewPending: (id: string, result: "成立" | "未達標準" | "無異常") => void;
    updateHistoryResult: (id: string, result: "成立" | "未達標準" | "無異常") => void;
    clearPending: () => void;
    addJournalRow: () => void;
    updateJournalItem: (id: string, updates: Partial<JournalItem>) => void;
    closeJournalItem: (id: string) => void;
    reopenJournalItem: (id: string) => void;
    deleteJournalItem: (id: string) => void;
    addJournalEntry: (entry: Omit<JournalItem, "id" | "isClosed">) => void;
    recordsItems: RecordItem[];
    recordsConfirmedItems: RecordItem[];
    addRecord: (item: Omit<RecordItem, "id">) => void;
    updateRecord: (id: string, updates: Partial<RecordItem>) => void;
    deleteRecord: (id: string) => void; // New function
    confirmRecord: (id: string) => void;
    unconfirmRecord: (id: string) => void;
    // Outbound
    outboundEvents: OutboundEvent[];
    setOutboundEvents: React.Dispatch<React.SetStateAction<OutboundEvent[]>>;
    deleteOutboundEvent: (id: string) => void; // New function
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
    const [pendingReports, setPendingReports] = useState<Report[]>([]);
    const [historyReports, setHistoryReports] = useState<Report[]>([]);
    const [journalOpenItems, setJournalOpenItems] = useState<JournalItem[]>([]);
    const [journalResolvedItems, setJournalResolvedItems] = useState<JournalItem[]>([]);
    const [recordsItems, setRecordsItems] = useState<RecordItem[]>([]);
    const [recordsConfirmedItems, setRecordsConfirmedItems] = useState<RecordItem[]>([]); // New state

    // --- Mock Data Init ---
    const [outboundEvents, setOutboundEvents] = useState<OutboundEvent[]>([
        {
            id: "o1",
            site: "A案場",
            date: "2024-02-01",
            source: "",
            status: "Ready",
            items: [
                { itemName: "SE5000H", oldSn: "old-111", newSn: "" }
            ],
        },
        {
            id: "o2",
            site: "B案場",
            date: "2024-02-05",
            source: "",
            status: "Missing",
            items: [
                { itemName: "SE10000H", oldSn: "", newSn: "" }
            ]
        },
        {
            id: "o3",
            site: "C案場",
            date: "2024-02-08",
            source: "公司庫存",
            status: "Ready",
            items: [
                { itemName: "SE5000H-RW000BEN4", oldSn: "", newSn: "new-333" },
                { itemName: "SE82.8K-RW0P0BNY4", oldSn: "old-999", newSn: "new-888" }
            ]
        },
    ]);

    const addPending = (report: Report) => {
        setPendingReports((prev) => [report, ...prev]);
    };

    const addJournalFromTask = (report: Report) => {
        // De-duplication based on taskId as sourceReportId
        const existsOpen = journalOpenItems.some(i => i.sourceReportId === report.id);
        const existsResolved = journalResolvedItems.some(i => i.sourceReportId === report.id);
        if (existsOpen || existsResolved) return;

        let createdDateISO = new Date().toISOString().split('T')[0];

        const newItem: JournalItem = {
            id: crypto.randomUUID(),
            status: "待處理",
            location: report.location || report.address || "",
            siteName: report.site || "",
            source: report.sourcePlatform || "其他",
            description: report.description,
            processStatus: "",
            handler: "",
            completedAt: "",
            isClosed: false,
            createdDateISO: createdDateISO,
            // Restored fields
            remark: report.remark || "",
            reporter: report.reporter || "",
            fingerprint: report.fingerprint || "",
            sourceReportId: report.id,
            region: report.region || "未知",
            repairCategory: report.repairCategory || "",
            contactInfo: report.contactInfo || ""
        };

        setJournalOpenItems(prev => [newItem, ...prev]);
    };

    const reviewPending = (id: string, result: "成立" | "未達標準" | "無異常") => {
        // Find the report first (outside of state setter to avoid side effects in strict mode)
        const target = pendingReports.find((r) => r.id === id);

        if (target) {
            const reviewedReport = {
                ...target,
                reviewResult: result,
                reviewedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
            };

            // Add to Journal if Approved ("成立")
            // This is now SAFE from double-execution because it's outside setPendingReports
            if (result === "成立") {
                addJournalFromTask(target);
            }

            setHistoryReports((h) => {
                return [reviewedReport, ...h];
            });
        }

        // Update Pending Reports (Pure update)
        setPendingReports((prev) => prev.filter((r) => r.id !== id));
    };

    const updateHistoryResult = (id: string, result: "成立" | "未達標準" | "無異常") => {
        // Sync to Journal if result is changed to "成立"
        if (result === "成立") {
            const target = historyReports.find(r => r.id === id);
            // Verify it wasn't already established to avoid unnecessary calls (though addJournalFromTask also de-dups)
            if (target && target.reviewResult !== "成立") {
                addJournalFromTask(target);
            }
        }

        setHistoryReports((prev) =>
            prev.map((report) =>
                report.id === id
                    ? {
                        ...report,
                        reviewResult: result,
                        reviewedAt: new Date().toLocaleString("zh-TW", { hour12: false })
                    }
                    : report
            )
        );
    };

    const clearPending = () => {
        setPendingReports([]);
    };

    const addJournalEntry = (entry: Omit<JournalItem, "id" | "isClosed">) => {
        const newItem: JournalItem = {
            ...entry,
            id: crypto.randomUUID(),
            isClosed: false,
        };
        setJournalOpenItems(prev => [newItem, ...prev]);
    };

    const addJournalRow = () => {
        const newItem: JournalItem = {
            id: crypto.randomUUID(),
            status: "待處理",
            location: "",
            siteName: "測試案場",
            source: "自主檢查",
            description: "測試問題描述...",
            processStatus: "",
            handler: "柚子",
            completedAt: "",
            isClosed: false,
            createdDateISO: new Date().toISOString().split('T')[0],
            remark: "",
            reporter: "測試員",
            fingerprint: "",
            region: "北區"
        };
        setJournalOpenItems(prev => [newItem, ...prev]);
    };

    const updateJournalItem = (id: string, updates: Partial<JournalItem>) => {
        // Try to update in open items first
        let foundv2 = false;
        setJournalOpenItems(prev => {
            if (prev.some(i => i.id === id)) {
                foundv2 = true;
                return prev.map(item => item.id === id ? { ...item, ...updates } : item);
            }
            return prev;
        });

        // If not found, try resolved items
        if (!foundv2) {
            setJournalResolvedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        }
    };

    const closeJournalItem = (id: string) => {
        setJournalOpenItems(prevOpen => {
            const itemToClose = prevOpen.find(i => i.id === id);

            // If not found in Open, or already exists in Resolved (safety check), do nothing
            if (!itemToClose) return prevOpen;

            setJournalResolvedItems(prevResolved => {
                // Double check if already in resolved to prevent duplicates
                if (prevResolved.some(i => i.id === id)) return prevResolved;

                return [{ ...itemToClose, isClosed: true }, ...prevResolved];
            });

            // Remove from Open
            return prevOpen.filter(i => i.id !== id);
        });
    };

    const reopenJournalItem = (id: string) => {
        setJournalResolvedItems(prevResolved => {
            const itemToReopen = prevResolved.find(i => i.id === id);

            // If not found in Resolved, do nothing
            if (!itemToReopen) return prevResolved;

            setJournalOpenItems(prevOpen => {
                // Double check if already in open to prevent duplicates
                if (prevOpen.some(i => i.id === id)) return prevOpen;

                return [{ ...itemToReopen, isClosed: false }, ...prevOpen];
            });

            // Remove from Resolved
            return prevResolved.filter(i => i.id !== id);
        });
    };

    const deleteJournalItem = (id: string) => {
        setJournalOpenItems(prev => prev.filter(i => i.id !== id));
        setJournalResolvedItems(prev => prev.filter(i => i.id !== id));
    };

    const addRecord = (item: Omit<RecordItem, "id">) => {
        const newItem: RecordItem = {
            ...item,
            id: crypto.randomUUID(),
        };
        setRecordsItems(prev => [newItem, ...prev]);
    };

    const updateRecord = (id: string, updates: Partial<RecordItem>) => {
        setRecordsItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        setRecordsConfirmedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteRecord = (id: string) => {
        setRecordsItems(prev => prev.filter(i => i.id !== id));
        setRecordsConfirmedItems(prev => prev.filter(i => i.id !== id));
    };

    const confirmRecord = (id: string) => {
        setRecordsItems(prevOpen => {
            const item = prevOpen.find(i => i.id === id);
            if (!item) return prevOpen;

            setRecordsConfirmedItems(prevConfirmed => {
                if (prevConfirmed.some(i => i.id === id)) return prevConfirmed; // Deduplicate

                // --- Sync to Outbound Event ---
                setOutboundEvents(prevOut => {
                    const existingIndex = prevOut.findIndex(e => e.sourceRefId === id);

                    // Map items from Record Pairs
                    const eventItems: EventItem[] = item.pairs.map(p => ({
                        itemName: p.newModel || p.oldModel || "多品項", // Fallback
                        oldSn: p.oldSerial,
                        newSn: p.newSerial
                    }));

                    const newEvent: OutboundEvent = {
                        id: existingIndex !== -1 ? prevOut[existingIndex].id : crypto.randomUUID(),
                        sourceRefId: item.id,
                        site: item.siteName,
                        date: item.completedDate || item.createdAtDate,
                        source: "", // Default empty as requested
                        status: "Missing", // Default missing until source selected
                        items: eventItems,
                        handlers: item.handlers,
                        photos: item.photos
                    };

                    if (existingIndex !== -1) {
                        // Update existing
                        const newArr = [...prevOut];
                        newArr[existingIndex] = { ...newArr[existingIndex], ...newEvent };
                        return newArr;
                    } else {
                        // Create new
                        return [newEvent, ...prevOut];
                    }
                });

                return [item, ...prevConfirmed];
            });

            return prevOpen.filter(i => i.id !== id);
        });
    };

    const deleteOutboundEvent = (id: string) => {
        setOutboundEvents(prev => prev.filter(e => e.id !== id));
    };

    const unconfirmRecord = (id: string) => {
        setRecordsConfirmedItems(prevConfirmed => {
            const item = prevConfirmed.find(i => i.id === id);
            if (!item) return prevConfirmed;

            setRecordsItems(prevOpen => {
                if (prevOpen.some(i => i.id === id)) return prevOpen;
                return [item, ...prevOpen];
            });

            return prevConfirmed.filter(i => i.id !== id);
        });
    };

    return (
        <ReportContext.Provider value={{
            pendingReports,
            historyReports,
            journalOpenItems,
            journalResolvedItems,
            addPending,
            reviewPending,
            updateHistoryResult,
            clearPending,
            addJournalRow,
            updateJournalItem,
            closeJournalItem,
            reopenJournalItem,
            deleteJournalItem,
            addJournalEntry,
            recordsItems,
            recordsConfirmedItems,
            addRecord,
            updateRecord,
            deleteRecord,
            confirmRecord,
            unconfirmRecord,
            outboundEvents,
            setOutboundEvents,
            deleteOutboundEvent
        }}>
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error("useReport must be used within a ReportProvider");
    }
    return context;
}
