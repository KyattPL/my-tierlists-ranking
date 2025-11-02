import { Category, TierList } from "@/app/page";

const soulsGames: TierList = {
    id: "souls-games",
    name: "Souls Games Ranking",
    description: "My personal ranking of FromSoft games",
    parentId: "souls-universe",
    type: 'list',
    children: [],
    schema: [
        { "id": "tier", "name": "Tier", "type": "tier", "options": ["S", "A", "B", "C", "D"] },
        { "id": "difficulty", "name": "Difficulty", "type": "rating", "max": 10 },
        { "id": "atmosphere", "name": "Atmosphere", "type": "rating", "max": 10 },
        { "id": "notes", "name": "Notes", "type": "text" }
    ],
    items: [
        {
            "id": "elden-ring",
            "name": "Elden Ring",
            "imageUrl": "/images/elden-ring.jpg",
            "values": {
                "tier": "S",
                "difficulty": 8,
                "atmosphere": 10,
                "notes": "Open world masterpiece"
            }
        }
    ]
};

const soulsFolder: Category = {
    id: "souls-universe",
    name: "Souls-like Universe",
    description: "All rankings related to FromSoftware's Souls-like games.",
    parentId: null,
    children: ["souls-games", "souls-bosses-category"],
    type: 'category',
};

const soulsBossesFolder: Category = {
    id: "souls-bosses-category",
    name: "Boss Fight Rankings",
    description: "Collections of boss fight tierlists.",
    parentId: "souls-universe",
    children: ["souls-bosses-all"],
    type: 'category',
};

const soulsBosses: TierList = {
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
}

export const soulsData = [soulsGames, soulsFolder, soulsBossesFolder, soulsBosses];