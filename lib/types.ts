export type TierType = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SchemaColumn {
  id: string;
  name: string;
  type: 'tier' | 'rating' | 'text' | 'image';
  options?: string[]; // For 'tier' or select types
  max?: number; // For ratings
  min?: number;
}

export interface TierListItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  values: Record<string, string | number>;
}

export interface BaseNode {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children: string[];
}

export interface Category extends BaseNode {
  type: 'category';
}

export interface TierList extends BaseNode {
  type: 'list';
  schema: SchemaColumn[];
  items: TierListItem[];
}

export type AppNode = Category | TierList;
