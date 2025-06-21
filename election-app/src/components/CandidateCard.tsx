import { Candidate } from '@/types/candidate';
import Image from 'next/image';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit?: (candidate: Candidate) => void;
  onDelete?: (candidate: Candidate) => void;
}

export default function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-64 w-full">
        {candidate.image ? (
          <Image
            src={candidate.image}
            alt={candidate.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">
                  {candidate.name.charAt(0)}
                </span>
              </div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(candidate)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                title="Edit candidate"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(candidate)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                title="Delete candidate"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {candidate.name}
          </h3>
          <div className="inline-block">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {candidate.party}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
          {candidate.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
} 