'use client';

import { Candidate } from '@/types/candidate';

interface PartyChartProps {
  candidates: Candidate[];
}

export default function PartyChart({ candidates }: PartyChartProps) {
  const partyStats = candidates.reduce((acc, candidate) => {
    acc[candidate.party] = (acc[candidate.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedParties = Object.entries(partyStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const maxCount = Math.max(...sortedParties.map(([, count]) => count), 1);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500',
    'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
  ];

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Party Distribution
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Party Distribution
        </h3>
        <div className="text-sm text-gray-500">
          {sortedParties.length} {sortedParties.length === 1 ? 'party' : 'parties'}
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedParties.map(([party, count], index) => {
          const percentage = (count / maxCount) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={party} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate" title={party}>
                  {party}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {count}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {sortedParties.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Add candidates to see party distribution</p>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Updates automatically as candidates are added or removed
      </div>
    </div>
  );
} 
