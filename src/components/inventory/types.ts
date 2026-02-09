export type InventoryItem = {
    model: string;
    stock: number;
    inMonth: number;
    usedMonth?: number;
    leftMonth?: number;
};

export type HistorySnapshot = {
    month: string; // YYYY-MM
    sealedAt: string; // YYYY-MM-DD HH:mm
    items: InventoryItem[];
};

export type InboundItem = {
    id: string;
    itemName: string;
    quantity: number;
};

export type InboundEvent = {
    id: string;
    siteName: string; // Optional, required if source is "案場退料"
    items: InboundItem[];
    source: string; // "中辦移轉" | "南辦移轉" | "SE寄送" | "案場退料"
    date: string;
    note: string;
    inboundPerson?: string; // New: Processing Person
    category?: "se" | "se_provided" | "general"; // New: Inbound Category
    status: "Pending" | "Verified";
    archived?: boolean;
};

export type SEPickupRecord = {
    id: string; // UUID
    project: string; // 案名 (Required)
    originalModel?: string; // 原故障型號
    faultySerial?: string; // 故障序號
    faultyReason?: string; // 故障原因
    newSerial?: string; // 新物料序號
    pickupMethod: string; // 收貨方式 (Default: "SE倉庫自取")
    pickupDate: string; // 取料時間 (Default: Today)
    replaceDate?: string; // 更換日期
    note?: string; // 備註事項
};
