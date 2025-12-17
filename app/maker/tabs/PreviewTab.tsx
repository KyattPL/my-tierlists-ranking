import { TierList, TierlistView } from '@/components/TierListShared'
import React from 'react'

interface Props {
    data: TierList;
}

const PreviewTab = ({ data }: Props) => {
    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Live Preview</h2>
            <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <TierlistView 
                    tierlist={data} 
                    viewMode="tier" 
                    sortConfig={null} 
                    onSort={() => {}} 
                />
            </div>
            <div className="mt-8 border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <TierlistView 
                    tierlist={data} 
                    viewMode="table" 
                    sortConfig={null} 
                    onSort={() => {}} 
                />
            </div>
        </div>
    )
}

export default PreviewTab