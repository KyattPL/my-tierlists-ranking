import React from 'react';

import { Copy } from 'lucide-react';
import { Category, TierList } from '@/components/TierListShared';
const toVarName = (id: string) => id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');

interface Props {
    data: TierList;
    createdCategories: Category[];
}

const CodeTab = ({ data, createdCategories }: Props) => {
    const generateCode = () => {
        let output = `import { Category, TierList } from "@/app/page";\n\n`;
        const exportNames: string[] = [];

        createdCategories.forEach(cat => {
            const varName = toVarName(cat.id);
            exportNames.push(varName);

            const childCats = createdCategories.filter(c => c.parentId === cat.id).map(c => c.id);
            if (data.parentId === cat.id) {
                childCats.push(data.id);
            }

            const catObj = { ...cat, children: childCats };
            output += `const ${varName}: Category = ${JSON.stringify(catObj, null, 2)};\n\n`;
        });

        const listVarName = toVarName(data.id);
        exportNames.push(listVarName);
        output += `const ${listVarName}: TierList = ${JSON.stringify(data, null, 2)};\n\n`;

        output += `export const ${toVarName(data.id)}Data = [${exportNames.join(', ')}];`;

        return output;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateCode());
        alert("Code copied!");
    };

  return (
        <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Export Code</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded mb-6">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
                  <li>Click the <strong>Copy Code</strong> button below.</li>
                  <li>Create a new file: <code>data/{data.id}.ts</code>.</li>
                  <li>Paste the code.</li>
                  <li>Open <code>data/tierlists-combined.ts</code>.</li>
                  <li>Import: <code>import {'{'} {toVarName(data.id)}Data {'}'} from &quot;./{data.id}&quot;;</code></li>
                  <li>Add to array: <code>...{toVarName(data.id)}Data</code></li>
                  {data.parentId && !createdCategories.find(c => c.id === data.parentId) && (
                    <li className="font-bold text-red-600 dark:text-red-400 mt-2">
                        IMPORTANT: You selected an EXISTING parent category ({data.parentId}). 
                        You must manually open the file containing that category and add &quot;{data.id}&quot; to its children array!
                    </li>
                  )}
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                  {generateCode()}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  <Copy className="w-4 h-4" /> Copy Code
                </button>
              </div>
        </div>  
  )
}

export default CodeTab;