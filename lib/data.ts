import fs from 'fs';
import path from 'path';
import { AppNode } from './types';

const DATA_DIR = path.join(process.cwd(), 'data/tierlists');

export async function getAllTierlists(): Promise<AppNode[]> {
  // Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));
  const nodes: AppNode[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      // Handle both single objects and arrays
      if (Array.isArray(data)) {
        nodes.push(...data);
      } else {
        nodes.push(data);
      }
    } catch (e) {
      console.error(`Error reading tierlist file ${file}:`, e);
    }
  }

  // Sort nodes? Or just return them.
  // For now, let's just return them.
  // We might want to construct the tree here or on the client. 
  // The current app expects a flat list of nodes where parentId links them.
  return nodes;
}

export async function saveTierlist(node: AppNode): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, `${node.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(node, null, 2));
    return true;
  } catch (e) {
    console.error(`Error saving tierlist ${node.id}:`, e);
    return false;
  }
}
