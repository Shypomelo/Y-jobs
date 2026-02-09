import { useState } from "react";
import Tab1SEInventory from "./NorthTab1SE";
import Tab2GeneralInventory from "./NorthTab2General";
import Tab3SupplyInventory from "./NorthTab3Supply";
import { InventoryItem, InboundEvent } from "./types";
import { OutboundEvent } from "@/app/providers";

type Props = {
    outboundEvents: OutboundEvent[];
    inventoryItems: InventoryItem[]; // General
    seInventoryItems: InventoryItem[]; // SE
    seProvidedInventoryItems: InventoryItem[]; // SE Provided
    inboundEvents: InboundEvent[];
    isEditMode: boolean;
    onUpdateStock: (model: string, newStock: number) => void;
    onAddItem: (category: "se" | "general" | "se_provided", newItem: InventoryItem) => void;
    onDeleteItem: (category: "se" | "general" | "se_provided", model: string) => void;
};

export default function TabGroupInventory({
    outboundEvents,
    inventoryItems,
    seInventoryItems,
    seProvidedInventoryItems,
    inboundEvents,
    isEditMode,
    onUpdateStock,
    onAddItem,
    onDeleteItem
}: Props) {
    const [activeTab, setActiveTab] = useState<"se" | "se_provided" | "general">("se");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("se")}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "se"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    Solaredge
                </button>
                <button
                    onClick={() => setActiveTab("se_provided")}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "se_provided"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    Solaredge提供
                </button>
                <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "general"
                        ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        }`}
                >
                    一般與耗材
                </button>
            </div>

            {activeTab === "se" && (
                <Tab1SEInventory
                    outboundEvents={outboundEvents}
                    inventoryItems={seInventoryItems}
                    inboundEvents={inboundEvents}
                    isEditMode={isEditMode}
                    onUpdateStock={onUpdateStock}
                    onAddItem={(item) => onAddItem("se", item)}
                    onDeleteItem={(model) => onDeleteItem("se", model)}
                />
            )}

            {activeTab === "se_provided" && (
                <Tab3SupplyInventory
                    inventoryItems={seProvidedInventoryItems}
                    onAddItem={(item) => onAddItem("se_provided", item)}
                    onDeleteItem={(model) => onDeleteItem("se_provided", model)}
                />
            )}

            {activeTab === "general" && (
                <Tab2GeneralInventory
                    inventoryItems={inventoryItems}
                    outboundEvents={outboundEvents}
                    inboundEvents={inboundEvents}
                    isEditMode={isEditMode}
                    onUpdateStock={onUpdateStock}
                    onAddItem={(item) => onAddItem("general", item)}
                    onDeleteItem={(model) => onDeleteItem("general", model)}
                />
            )}
        </div>
    );
}
