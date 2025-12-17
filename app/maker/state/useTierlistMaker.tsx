"use client";

import { useState, useMemo } from "react";
import { Category, TierList } from "@/components/TierListShared";

const DEFAULT_SCHEMA = [
  { id: "tier", name: "Tier", type: "tier" as const, options: ["S","A","B","C","D","F"] },
  { id: "rating", name: "Rating", type: "rating" as const, max: 10 },
  { id: "notes", name: "Notes", type: "text" as const }
];

export function useTierlistMaker() {

    const [createdCategories, setCreatedCategories] = useState<Category[]>([]);

    const [data, setData] = useState<TierList>({
        id: "new-tierlist",
        name: "New Tierlist",
        description: "",
        parentId: null,
        type: "list",
        children: [],
        schema: DEFAULT_SCHEMA,
        items: []
    });

    const addItem = (tier?: string) => {
        const id = `item_${Date.now()}`;
        const values: Record<string, string | number> = {};
        data.schema.forEach(col => {
        if (col.type === "tier") values[col.id] = tier ?? "B";
        if (col.type === "rating") values[col.id] = 0;
        if (col.type === "text") values[col.id] = "";
        });

        setData(d => ({
        ...d,
        items: [...d.items, { id, name: "New Item", values }]
        }));
    };

    const updateItemName = (id: string, name: string) =>
        setData(d => ({
        ...d,
        items: d.items.map(i => i.id === id ? { ...i, name } : i)
        }));

    const removeItem = (id: string) =>
        setData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));

    const setItemValue = (id: string, key: string, value: string | number) =>
        setData(d => ({
        ...d,
        items: d.items.map(i =>
            i.id === id
            ? { ...i, values: { ...i.values, [key]: value } }
            : i
        )
        }));

    const tierColumn = useMemo(
        () => data.schema.find(c => c.type === "tier"),
        [data.schema]
    );

    return {
        data,
        setData,
        tierColumn,
        addItem,
        updateItemName,
        removeItem,
        setItemValue,
        createdCategories,
        setCreatedCategories
    };
}
