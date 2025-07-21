'use client';

import { useState, useCallback, useRef } from 'react';
import WellPlate, { WellData } from './WellPlate';
import SelectionModeToggle from './SelectionModeToggle';
import SampleForm, { Sample } from './SampleForm';
import SamplesTable from './SamplesTable';
import { ArrowRight, Download, Upload, AlertCircle } from 'lucide-react';
import { exportSamples, importSamples } from '@/utils/sampleIO';

interface SampleSelectionProps {
  onContinue: (samples: Sample[]) => void;
}

export default function SampleSelection({ onContinue }: SampleSelectionProps) {
  const [selectionMode, setSelectionMode] = useState<'background' | 'sample'>('background');
  const [selectedWells, setSelectedWells] = useState<WellData[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [currentSampleName, setCurrentSampleName] = useState('');
  const [highlightedSample, setHighlightedSample] = useState<Sample | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get currently selected background well
  const selectedBackgroundWell = selectedWells.find(w => w.type === 'background')?.id || null;
  
  // Get currently selected sample wells
  const selectedSampleWells = selectedWells.filter(w => w.type === 'sample').map(w => w.id);

  const handleWellClick = useCallback((wellId: string) => {
    setSelectedWells(prev => {
      const existingWell = prev.find(w => w.id === wellId);
      
      if (selectionMode === 'background') {
        // For background mode, only allow one selection
        if (existingWell?.type === 'background') {
          // Remove if already selected as background
          return prev.filter(w => w.id !== wellId);
        } else {
          // Remove any existing background well and add new one
          return [
            ...prev.filter(w => w.type !== 'background' && w.id !== wellId),
            {
              id: wellId,
              row: wellId[0],
              col: parseInt(wellId.slice(1)),
              type: 'background' as const,
              sampleName: currentSampleName
            }
          ];
        }
      } else {
        // For sample mode, allow multiple selections
        if (existingWell?.type === 'sample') {
          // Remove if already selected as sample
          return prev.filter(w => w.id !== wellId);
        } else {
          // Add as sample well (remove any other type first)
          return [
            ...prev.filter(w => w.id !== wellId),
            {
              id: wellId,
              row: wellId[0],
              col: parseInt(wellId.slice(1)),
              type: 'sample' as const,
              sampleName: currentSampleName
            }
          ];
        }
      }
    });
  }, [selectionMode, currentSampleName]);

  const handleAddSample = useCallback((newSample: Omit<Sample, 'id'>) => {
    const sampleId = Date.now().toString();
    setSamples(prev => [...prev, { ...newSample, id: sampleId }]);
    
    // Clear the entire plate after adding sample
    setSelectedWells([]);
    // Reset the selection mode to background for the next sample
    setSelectionMode('background');
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedWells(prev => prev.filter(w => w.sampleName)); // Keep wells that are part of existing samples
  }, []);

  const handleUpdateSample = useCallback((id: string, updatedSample: Omit<Sample, 'id'>) => {
    setSamples(prev => prev.map(sample => 
      sample.id === id ? { ...updatedSample, id } : sample
    ));
    
    // Update well data with new sample name
    const sample = samples.find(s => s.id === id);
    if (sample) {
      setSelectedWells(prev => prev.map(well => {
        if ((well.type === 'background' && well.id === sample.backgroundWell) ||
            (well.type === 'sample' && sample.sampleWells.includes(well.id))) {
          return { ...well, sampleName: updatedSample.sampleName };
        }
        return well;
      }));
    }
  }, [samples]);

  const handleDeleteSample = useCallback((id: string) => {
    const sampleToDelete = samples.find(s => s.id === id);
    if (sampleToDelete) {
      // Remove wells associated with this sample
      setSelectedWells(prev => prev.filter(well => {
        return !((well.type === 'background' && well.id === sampleToDelete.backgroundWell) ||
                 (well.type === 'sample' && sampleToDelete.sampleWells.includes(well.id)));
      }));
    }
    
    setSamples(prev => prev.filter(sample => sample.id !== id));
  }, [samples]);

  const handleReorderSamples = useCallback((reorderedSamples: Sample[]) => {
    setSamples(reorderedSamples);
  }, []);

  const handleHoverSample = useCallback((sample: Sample | null) => {
    setHighlightedSample(sample);
  }, []);

  const handleClearPlate = useCallback(() => {
    if (confirm('Are you sure you want to clear all well selections? This will remove all current selections but keep existing samples.')) {
      setSelectedWells([]);
    }
  }, []);

  const handleExportSamples = useCallback(() => {
    if (samples.length === 0) {
      alert('No samples to export. Please add some samples first.');
      return;
    }
    
    try {
      exportSamples(samples);
    } catch (error) {
      alert('Failed to export samples. Please try again.');
      console.error('Export error:', error);
    }
  }, [samples]);

  const handleImportClick = useCallback(() => {
    setImportError(null);
    setImportSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const fileContent = await file.text();
      const importedSamples = await importSamples(fileContent);
      
      if (samples.length > 0) {
        const shouldReplace = confirm(
          `You have ${samples.length} existing sample(s). Do you want to replace them with the imported ${importedSamples.length} sample(s)?`
        );
        
        if (!shouldReplace) {
          setIsImporting(false);
          return;
        }
      }
      
      // Clear current selections and set imported samples
      setSelectedWells([]);
      setSamples(importedSamples);
      
      // Reconstruct well selections from imported samples
      const newSelectedWells: WellData[] = [];
      importedSamples.forEach(sample => {
        if (sample.backgroundWell) {
          newSelectedWells.push({
            id: sample.backgroundWell,
            row: sample.backgroundWell[0],
            col: parseInt(sample.backgroundWell.slice(1)),
            type: 'background',
            sampleName: sample.sampleName
          });
        }
        
        sample.sampleWells.forEach(wellId => {
          newSelectedWells.push({
            id: wellId,
            row: wellId[0],
            col: parseInt(wellId.slice(1)),
            type: 'sample',
            sampleName: sample.sampleName
          });
        });
      });
      
      setSelectedWells(newSelectedWells);
      
      // Show success message
      setImportSuccess(`Successfully imported ${importedSamples.length} sample(s) from ${file.name}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setImportSuccess(null);
      }, 5000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportError(errorMessage);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [samples]);

  const handleContinue = () => {
    if (samples.length > 0) {
      onContinue(samples);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selection Mode Toggle */}
      <SelectionModeToggle 
        selectionMode={selectionMode}
        onModeChange={setSelectionMode}
      />

      {/* Well Plate */}
      <WellPlate
        selectedWells={selectedWells}
        onWellClick={handleWellClick}
        selectionMode={selectionMode}
        currentSampleName={currentSampleName}
        highlightedSample={highlightedSample}
        onClearPlate={handleClearPlate}
      />

      {/* Sample Form and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SampleForm
          onAddSample={handleAddSample}
          selectedBackgroundWell={selectedBackgroundWell}
          selectedSampleWells={selectedSampleWells}
          onClearSelection={handleClearSelection}
        />
        
        <div className="space-y-4">
          {/* Import/Export Section */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">Sample Configuration</h4>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importing...' : 'Import Samples'}
              </button>
              
              <button
                onClick={handleExportSamples}
                disabled={samples.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={samples.length === 0 ? 'No samples to export' : `Export ${samples.length} sample(s)`}
              >
                <Download className="w-4 h-4" />
                Save & Export
              </button>
            </div>
            
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            
            {/* Import Success Display */}
            {importSuccess && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-sm text-green-700">
                    {importSuccess}
                  </div>
                </div>
              </div>
            )}
            
            {/* Import Error Display */}
            {importError && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <strong>Import failed:</strong> {importError}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <SamplesTable
            samples={samples}
            onUpdateSample={handleUpdateSample}
            onDeleteSample={handleDeleteSample}
            onReorderSamples={handleReorderSamples}
            onHoverSample={handleHoverSample}
          />
        </div>
      </div>

      {/* Continue Button */}
      {samples.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue to Plot Generation
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
} 