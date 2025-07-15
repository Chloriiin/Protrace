'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface Sample {
  id: string;
  sampleName: string;
  backgroundWell: string | null;
  sampleWells: string[];
}

interface SampleFormProps {
  onAddSample: (sample: Omit<Sample, 'id'>) => void;
  selectedBackgroundWell: string | null;
  selectedSampleWells: string[];
  onClearSelection: () => void;
}

export default function SampleForm({ 
  onAddSample, 
  selectedBackgroundWell, 
  selectedSampleWells,
  onClearSelection 
}: SampleFormProps) {
  const [sampleName, setSampleName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!sampleName.trim()) {
      setError('Sample name is required');
      return;
    }

    if (!selectedBackgroundWell && selectedSampleWells.length === 0) {
      setError('Please select at least one well (background or sample)');
      return;
    }

    // Create sample
    const newSample: Omit<Sample, 'id'> = {
      sampleName: sampleName.trim(),
      backgroundWell: selectedBackgroundWell,
      sampleWells: selectedSampleWells
    };

    onAddSample(newSample);
    setSampleName('');
    onClearSelection();
  };

  const handleCancel = () => {
    setSampleName('');
    setError('');
    onClearSelection();
  };

  const hasSelection = selectedBackgroundWell || selectedSampleWells.length > 0;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Sample</h4>
      
      {/* Current Selection Display */}
      {hasSelection && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">Current Selection:</div>
            {selectedBackgroundWell && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-gray-900 rounded-full"></span>
                <span>Background: {selectedBackgroundWell}</span>
              </div>
            )}
            {selectedSampleWells.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-gray-600 rounded-full"></span>
                <span>
                  Sample wells: {selectedSampleWells.join(', ')}
                  {selectedSampleWells.length > 1 && ` (${selectedSampleWells.length} wells)`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sampleName" className="block text-sm font-medium text-gray-700 mb-1">
            Sample Name
          </label>
          <input
            type="text"
            id="sampleName"
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter sample name..."
            disabled={!hasSelection}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!hasSelection || !sampleName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sample
          </button>
          
          {hasSelection && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      {!hasSelection && (
        <div className="mt-3 text-sm text-gray-500">
          Select wells on the plate above to add a sample
        </div>
      )}
    </div>
  );
} 