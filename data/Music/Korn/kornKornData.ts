import { Category, TierList } from "@/app/page";

const music: Category = {
    "id": "music",
    "name": "Music",
    "description": "Container for Music",
    "parentId": null,
    "children": [
        "metal"
    ],
    "type": "category"
};

const metal: Category = {
    "id": "metal",
    "name": "Metal",
    "description": "Container for Metal",
    "parentId": "music",
    "children": [
        "korn"
    ],
    "type": "category"
};

const korn: Category = {
    "id": "korn",
    "name": "Korn",
    "description": "Container for Korn",
    "parentId": "metal",
    "children": [
        "korn-korn"
    ],
    "type": "category"
};

const kornKorn: TierList = {
    "id": "korn-korn",
    "name": "Korn - Korn",
    "description": "Tierlist about Korn's \"Korn\" album.",
    "parentId": "korn",
    "type": "list",
    "children": [],
    "schema": [
        {
            "id": "tier",
            "name": "Tier",
            "type": "tier",
            "options": [
                "S",
                "A",
                "B",
                "C",
                "D",
                "F"
            ]
        },
        {
            "id": "notes",
            "name": "Notes",
            "type": "text"
        },
        {
            "id": "col_1767130546393",
            "name": "Lyrics",
            "type": "rating",
            "min": 1
        },
        {
            "id": "col_1767130546926",
            "name": "Soul",
            "type": "rating",
            "min": 1
        },
        {
            "id": "col_1767130560133",
            "name": "Groove",
            "type": "rating",
            "min": 1
        }
    ],
    "items": [
        {
            "id": "item_1767130585947",
            "name": "Blind",
            "values": {
                "tier": "A",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130592198",
            "name": "Helmet in The Bush",
            "values": {
                "tier": "B",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130599419",
            "name": "Lies",
            "values": {
                "tier": "C",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130605622",
            "name": "Predictable",
            "values": {
                "tier": "D",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130611651",
            "name": "Fake",
            "values": {
                "tier": "F",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130615775",
            "name": "Faget",
            "values": {
                "tier": "S",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130621391",
            "name": "Need To",
            "values": {
                "tier": "S",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130639097",
            "name": "Ball Tongue",
            "values": {
                "tier": "A",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130649083",
            "name": "Daddy",
            "values": {
                "tier": "B",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130650197",
            "name": "Shoots and Ladders",
            "values": {
                "tier": "C",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130684572",
            "name": "Divine",
            "values": {
                "tier": "D",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        },
        {
            "id": "item_1767130686326",
            "name": "Clown",
            "values": {
                "tier": "F",
                "notes": "",
                "col_1767130546393": 1,
                "col_1767130546926": 1,
                "col_1767130560133": 1
            }
        }
    ]
};

export const kornKornData = [music, metal, korn, kornKorn];