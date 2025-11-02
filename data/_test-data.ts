import { AppNode } from "@/app/page";

const mockData: AppNode[] = [
    {
        id: "souls-universe",
        name: "Souls-like Universe",
        description: "All rankings related to FromSoftware's Souls-like games.",
        parentId: null,
        children: ["souls-games-overall", "souls-bosses-category"],
        type: 'category',
    },
    {
        id: "souls-games-overall",
        name: "Overall Souls Games",
        description: "FromSoft games ranked",
        parentId: "souls-universe",
        children: [],
        type: 'list',
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "difficulty", name: "Difficulty", type: "rating", max: 10 },
            { id: "atmosphere", name: "Atmosphere", type: "rating", max: 10 }
        ],
        items: [
            { id: "1", name: "Elden Ring", values: { tier: "S", difficulty: 8, atmosphere: 10 } },
            { id: "2", name: "Bloodborne", values: { tier: "S", difficulty: 9, atmosphere: 10 } },
            { id: "3", name: "Dark Souls 3", values: { tier: "A", difficulty: 8, atmosphere: 9 } },
            { id: "4", name: "Sekiro", values: { tier: "A", difficulty: 10, atmosphere: 8 } },
            { id: "5", name: "Dark Souls", values: { tier: "B", difficulty: 7, atmosphere: 8 } },
            { id: "6", name: "Dark Souls 2", values: { tier: "C", difficulty: 6, atmosphere: 6 } }
        ]
    },
    {
        id: "souls-bosses-category",
        name: "Boss Fight Rankings",
        description: "Collections of boss fight tierlists.",
        parentId: "souls-universe",
        children: ["souls-bosses-all", "future-dlc-bosses"],
        type: 'category',
    },
    {
        id: "souls-bosses-all",
        name: "All Boss Fights",
        description: "Best boss fights across all games",
        parentId: "souls-bosses-category",
        children: [],
        type: 'list',
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "difficulty", name: "Difficulty", type: "rating", max: 10 },
            { id: "epicness", name: "Epicness", type: "rating", max: 10 },
            { id: "notes", name: "Notes", type: "text" }
        ],
        items: [
            { id: "1", name: "Malenia", values: { tier: "S", difficulty: 10, epicness: 10, notes: "Hardest boss ever" } },
            { id: "2", name: "Orphan of Kos", values: { tier: "S", difficulty: 10, epicness: 9, notes: "Brutal fight" } },
            { id: "3", name: "Isshin", values: { tier: "S", difficulty: 10, epicness: 10, notes: "Perfect duel" } },
            { id: "4", name: "Artorias", values: { tier: "A", difficulty: 7, epicness: 9, notes: "Iconic" } }
        ]
    },
    {
        id: "future-dlc-bosses",
        name: "Future DLC Bosses",
        description: "A place for future DLC boss rankings.",
        parentId: "souls-bosses-category",
        children: [], // This is an empty category
        type: 'category',
    },
    {
        id: "lol-worlds",
        name: "LoL Worlds Songs",
        description: "Ranking of Worlds anthems",
        parentId: null,
        children: [],
        type: 'list',
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "hype", name: "Hype", type: "rating", max: 10 },
            { id: "year", name: "Year", type: "text" }
        ],
        items: [
            { id: "1", name: "RISE", values: { tier: "S", hype: 10, year: "2018" } },
            { id: "2", name: "Warriors", values: { tier: "S", hype: 10, year: "2014" } },
            { id: "3", name: "Legends Never Die", values: { tier: "A", hype: 9, year: "2017" } },
            { id: "4", name: "Phoenix", values: { tier: "A", hype: 8, year: "2019" } }
        ]
    }
];