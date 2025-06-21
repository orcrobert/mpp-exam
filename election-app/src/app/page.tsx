'use client';

import { useState, useEffect } from 'react';
import { useCandidates } from '@/contexts/CandidateContext';
import { Candidate } from '@/types/candidate';
import CandidateGrid from '@/components/CandidateGrid';
import CandidateForm from '@/components/CandidateForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import PartyChart from '@/components/PartyChart';

export default function Home() {
  const { 
    candidates, 
    loading, 
    error, 
    addCandidate, 
    updateCandidate, 
    deleteCandidate,
    isGenerating,
    generatedCount,
    websocketConnected,
    startAutoGeneration,
    stopAutoGeneration
  } = useCandidates();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);

  const handleAddCandidate = () => {
    setEditingCandidate(null);
    setShowForm(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setDeletingCandidate(candidate);
  };

  const handleFormSubmit = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, candidateData);
      } else {
        await addCandidate(candidateData);
      }
      setShowForm(false);
      setEditingCandidate(null);
    } catch (err) {
      // Error is handled by the context
      console.error('Failed to submit form:', err);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCandidate(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingCandidate) {
      try {
        await deleteCandidate(deletingCandidate.id);
        setDeletingCandidate(null);
      } catch (err) {
        // Error is handled by the context
        console.error('Failed to delete candidate:', err);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingCandidate(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Election 2024
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Meet the candidates running for office. Manage candidate profiles, 
                party affiliations, and policy positions.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* WebSocket Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${websocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {websocketConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Auto-generation controls */}
              <div className="flex gap-2">
                {!isGenerating ? (
                  <button
                    onClick={startAutoGeneration}
                    disabled={!websocketConnected}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Auto-Gen
                  </button>
                ) : (
                  <button
                    onClick={stopAutoGeneration}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                    </svg>
                    Stop Auto-Gen
                  </button>
                )}
              </div>
              
              <button
                onClick={handleAddCandidate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Manually
              </button>
            </div>
          </div>
          
          {/* Generation status */}
          {isGenerating && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 text-sm font-medium">
                  Auto-generating candidates... ({generatedCount} generated this session)
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Statistics and Chart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {candidates.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {new Set(candidates.map(c => c.party)).size}
                  </div>
                  <div className="text-sm text-gray-600">Political Parties</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {generatedCount}
                  </div>
                  <div className="text-sm text-gray-600">Auto-Generated</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Party Chart */}
          <div className="lg:col-span-1">
            <PartyChart candidates={candidates} />
          </div>
        </div>
      </section>

      {/* Candidates Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Manage Candidates
          </h2>
          <p className="text-gray-600">
            Add candidates manually or use auto-generation. Click on the edit or delete buttons on each card to manage candidates.
          </p>
        </div>
        
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding candidates manually or using auto-generation.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleAddCandidate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Add Manually
              </button>
              <button
                onClick={startAutoGeneration}
                disabled={!websocketConnected}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Start Auto-Generation
              </button>
            </div>
          </div>
        ) : (
          <CandidateGrid 
            candidates={candidates}
            onEdit={handleEditCandidate}
            onDelete={handleDeleteCandidate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Election Portal. Built with Next.js, TypeScript, and Socket.IO.
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Your vote matters. Make sure to register and vote on Election Day.
          </p>
        </div>
      </footer>

      {/* Forms and Modals */}
      {showForm && (
        <CandidateForm
          candidate={editingCandidate || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          submitLabel={editingCandidate ? 'Update Candidate' : 'Add Candidate'}
        />
      )}

      {deletingCandidate && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Candidate"
          message={`Are you sure you want to delete ${deletingCandidate.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          dangerous={true}
        />
      )}
    </div>
  );
}
