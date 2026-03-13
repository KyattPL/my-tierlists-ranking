import React from 'react';

import { Copy } from 'lucide-react';
import { TierListDraft } from '@/lib/types';

interface Props {
    data: TierListDraft;
}

const CodeTab = ({ data }: Props) => {
    const generateJson = () => JSON.stringify(data, null, 2);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateJson());
        alert("JSON copied!");
    };

  return (
        <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Export JSON</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded mb-6">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
                  <li>Click the <strong>Copy JSON</strong> button below.</li>
                  <li>Create (or choose) a folder inside <code>data/tierlists</code> that matches your category path.</li>
                  <li>Save the JSON as <code>{data.id}.json</code> in that folder.</li>
                  <li>Restart the dev server to see it in the Library.</li>
                  <li>Categories and children are inferred automatically from folder structure.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                  {generateJson()}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  <Copy className="w-4 h-4" /> Copy JSON
                </button>
              </div>
        </div>  
  )
}

export default CodeTab;
