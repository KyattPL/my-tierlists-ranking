import { SchemaColumn } from "@/lib/types";

export interface SchemaPreset {
    id: string;
    name: string;
    description: string;
    schema: SchemaColumn[];
}

export interface TierlistPreset {
    id: string;
    name: string;
    description: string;
    schema: SchemaColumn[];
    defaults?: {
        name?: string;
        id?: string;
        description?: string;
    };
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

const FALLBACK_SCHEMA: SchemaColumn[] = [
    { id: "tier", name: "Tier", type: "tier", options: ["S", "A", "B", "C", "D", "F"] },
    { id: "rating", name: "Rating", type: "rating", max: 10 },
    { id: "notes", name: "Notes", type: "text" }
];

const getSchemaPreset = (id: string): SchemaColumn[] => {
    return SCHEMA_PRESETS.find(preset => preset.id === id)?.schema ?? FALLBACK_SCHEMA;
};

export const TIERLIST_PRESETS: TierlistPreset[] = [
    {
        id: "music-album",
        name: "Music Album",
        description: "A music-focused template for ranking tracks or full albums.",
        schema: getSchemaPreset("music"),
        defaults: {
            name: "Music Album Ranking",
            id: "music-album",
            description: "Rank the tracks from a music album."
        }
    },
    {
        id: "game-bosses",
        name: "Game Bosses",
        description: "Built for ranking boss encounters by fairness, spectacle, and difficulty.",
        schema: getSchemaPreset("boss"),
        defaults: {
            name: "Game Boss Rankings",
            id: "game-bosses",
            description: "Rank boss fights across games."
        }
    },
    {
        id: "video-game-review",
        name: "Video Game Review",
        description: "A deep-dive game review with gameplay, story, and presentation ratings.",
        schema: getSchemaPreset("game"),
        defaults: {
            name: "Video Game Tierlist",
            id: "video-game-tierlist",
            description: "Rank games across the core pillars of the experience."
        }
    },
    {
        id: "movies-tv",
        name: "Movies / TV",
        description: "A cinephile-flavored ranking preset for movies or TV seasons.",
        schema: getSchemaPreset("movie"),
        defaults: {
            name: "Movies & TV Rankings",
            id: "movies-tv",
            description: "Rank movies or TV seasons by plot, pacing, and rewatchability."
        }
    }
];
