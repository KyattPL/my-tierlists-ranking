import { SchemaColumn } from "@/lib/types";

export interface SchemaPreset {
    id: string;
    name: string;
    description: string;
    schema: SchemaColumn[];
}

export const SCHEMA_PRESETS: SchemaPreset[] = [
    {
        id: "game",
        name: "Video Game (Deep Dive)",
        description: "Focuses on the core pillars of the gaming experience: mechanics, narrative, and world-building.",
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "gameplay", name: "Gameplay & Mechanics", type: "rating", min: 0, max: 10 },
            { id: "plot", name: "Story & Narrative", type: "rating", min: 0, max: 10 },
            { id: "visuals", name: "Art & Level Design", type: "rating", min: 0, max: 10 },
            { id: "audio", name: "Soundtrack/SFX", type: "rating", min: 0, max: 10 },
            { id: "performance", name: "Performance/Bugs", type: "text" },
            { id: "playtime", name: "Hours Played", type: "text" }
        ]
    },
    {
        id: "music",
        name: "Music / Album (Vibe Check)",
        description: "Ranks music based on emotional resonance, lyrical depth, and overall production quality.",
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "feeling", name: "The 'Goosebumps' Factor", type: "rating", min: 0, max: 10 },
            { id: "vibe", name: "Vibe (Fun/Listenability)", type: "rating", min: 0, max: 10 },
            { id: "lyrics", name: "Lyrics", type: "rating", min: 0, max: 10 },
            { id: "originality", name: "Originality (Uniqueness)", type: "rating", min: 0, max: 10 }
        ]
    },
    {
        id: "boss",
        name: "Souls-like Bosses",
        description: "Specific metrics for challenging boss encounters. Ranks fairness, spectacle, and the 'git gud' curve.",
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "fairness", name: "Mechanical Fairness", type: "rating", min: 0, max: 10 },
            { id: "epicness", name: "Audio-Visual Epicness", type: "rating", min: 0, max: 10 },
            { id: "difficulty", name: "Pure Difficulty", type: "rating", min: 0, max: 10 },
            { id: "moveset", name: "Moveset Variety", type: "rating", min: 0, max: 10 },
            { id: "runback", name: "Runback (Walk of Shame)", type: "rating", min: 0, max: 10 }
        ]
    },
    {
        id: "movie",
        name: "Cinephile (Movies/TV)",
        description: "Goes beyond 'I liked it' to rank cinematography, pacing, and rewatchability.",
        schema: [
            { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
            { id: "plot", name: "Plot", type: "rating", min: 0, max: 10 },
            { id: "pacing", name: "Pacing", type: "rating", min: 0, max: 10 },
            { id: "soundtrack", name: "Soundtrack", type: "rating", min: 0, max: 10 },
            { id: "rewatchability", name: "Rewatch Value", type: "rating", min: 0, max: 10 }
        ]
    }
];