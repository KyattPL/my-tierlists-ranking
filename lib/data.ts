import fs from 'fs';
import path from 'path';
import { AppNode, Category, TierList } from './types';

const DATA_DIR = path.join(process.cwd(), 'data/tierlists');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeName = (value: string) => value.replace(/\s+/g, ' ').trim();

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getJsonFilesRecursive = (dirPath: string): string[] => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getJsonFilesRecursive(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
};

const getDirectoriesRecursive = (dirPath: string): string[] => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      dirs.push(fullPath);
      dirs.push(...getDirectoriesRecursive(fullPath));
    }
  }

  return dirs;
};

const normalizeCategory = (node: Category): Category => ({
  id: node.id,
  name: node.name,
  description: node.description,
  parentId: null,
  children: [],
  type: 'category'
});

const normalizeTierList = (node: TierList): TierList => ({
  id: node.id,
  name: node.name,
  description: node.description,
  parentId: null,
  children: [],
  type: 'list',
  schema: node.schema ?? [],
  items: node.items ?? []
});

const buildSegmentChain = (dirSegments: string[]) =>
  dirSegments
    .map(segment => ({
      id: slugify(segment),
      name: normalizeName(segment)
    }))
    .filter(segment => segment.id);

export async function getAllTierlists(): Promise<AppNode[]> {
  ensureDirExists(DATA_DIR);

  const files = getJsonFilesRecursive(DATA_DIR);
  const nodes: AppNode[] = [];
  const folderCategories = new Map<string, Category>();
  const folderCategoryOverrides = new Map<string, Partial<Category>>();
  const explicitCategoryIds = new Set<string>();

  const ensureFolderCategories = (dirSegments: string[]) => {
    const chain = buildSegmentChain(dirSegments);
    chain.forEach((segment, index) => {
      const parentId = index === 0 ? null : chain[index - 1]?.id ?? null;

      if (folderCategories.has(segment.id)) {
        const existing = folderCategories.get(segment.id);
        if (existing && existing.parentId !== parentId) {
          console.warn(
            `Folder category id "${segment.id}" appears under multiple parents (${existing.parentId ?? 'root'} and ${parentId ?? 'root'}). Consider renaming one folder to keep ids unique.`
          );
        }
        return;
      }

      folderCategories.set(segment.id, {
        id: segment.id,
        name: segment.name,
        description: `Container for ${segment.name}`,
        parentId,
        children: [],
        type: 'category'
      });
    });

    return chain.map(segment => segment.id);
  };

  const directories = getDirectoriesRecursive(DATA_DIR);
  directories.forEach(dirPath => {
    const relativeDir = path.relative(DATA_DIR, dirPath);
    const dirSegments =
      relativeDir === '.' ? [] : relativeDir.split(path.sep).filter(Boolean);
    ensureFolderCategories(dirSegments);
  });

  for (const filePath of files) {
    const relativePath = path.relative(DATA_DIR, filePath);
    const relativeDir = path.dirname(relativePath);
    const dirSegments =
      relativeDir === '.' ? [] : relativeDir.split(path.sep).filter(Boolean);
    const segmentIds = ensureFolderCategories(dirSegments);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;

        if (item.type === 'category') {
          if (segmentIds.includes(item.id)) {
            folderCategoryOverrides.set(item.id, {
              name: item.name,
              description: item.description
            });
            continue;
          }

          if (item.parentId) {
            console.warn(
              `Category ${item.id} specifies parentId (${item.parentId}) but folder structure is the source of truth. Ignoring parentId.`
            );
          }
          explicitCategoryIds.add(item.id);
          nodes.push(normalizeCategory(item as Category));
          continue;
        }

        if (item.type === 'list') {
          const normalized = normalizeTierList(item as TierList);
          const folderParentId =
            segmentIds.length > 0 ? segmentIds[segmentIds.length - 1] : null;
          if (item.parentId && item.parentId !== folderParentId) {
            console.warn(
              `Tierlist ${normalized.id} specifies parentId (${item.parentId}) but folder structure is the source of truth. Using folder parent (${folderParentId ?? 'root'}).`
            );
          }
          normalized.parentId = folderParentId;
          nodes.push(normalized);
        }
      }
    } catch (e) {
      console.error(`Error reading tierlist file ${relativePath}:`, e);
    }
  }

  folderCategories.forEach((category, id) => {
    if (explicitCategoryIds.has(id)) return;

    const overrides = folderCategoryOverrides.get(id);
    nodes.push({
      ...category,
      ...(overrides?.name ? { name: overrides.name } : {}),
      ...(overrides?.description ? { description: overrides.description } : {})
    });
  });

  const nodesById = new Map<string, AppNode>();
  nodes.forEach(node => {
    if (!nodesById.has(node.id)) {
      nodesById.set(node.id, { ...node, children: [] });
    }
  });

  nodesById.forEach(node => {
    if (!node.parentId) return;
    const parent = nodesById.get(node.parentId);
    if (!parent || parent.type !== 'category') {
      console.warn(
        `Parent category ${node.parentId} not found for node ${node.id}.`
      );
      return;
    }
    parent.children.push(node.id);
  });

  nodesById.forEach(node => {
    if (node.type !== 'category') return;
    node.children.sort((aId, bId) => {
      const aNode = nodesById.get(aId);
      const bNode = nodesById.get(bId);
      if (!aNode || !bNode) return 0;
      return aNode.name.localeCompare(bNode.name);
    });
  });

  return Array.from(nodesById.values());
}

export async function saveTierlist(node: AppNode): Promise<boolean> {
  try {
    ensureDirExists(DATA_DIR);
    const filePath = path.join(DATA_DIR, `${node.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(node, null, 2));
    return true;
  } catch (e) {
    console.error(`Error saving tierlist ${node.id}:`, e);
    return false;
  }
}
