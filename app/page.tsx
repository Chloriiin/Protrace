'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import SampleSelection from '@/components/SampleSelection';
import PlotGeneration from '@/components/PlotGeneration';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Sample } from '@/components/SampleForm';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name);
    // TODO: Process the file with PyScript
  };

  const handleSampleSelection = (selectedSamples: Sample[]) => {
    setSamples(selectedSamples);
    console.log('Samples selected:', selectedSamples);
    setCurrentStep(3);
  };

  const handleRestartClick = () => {
    setShowRestartConfirmation(true);
  };

  const handleRestartConfirm = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setSamples([]);
    setShowRestartConfirmation(false);
  };

  const handleRestartCancel = () => {
    setShowRestartConfirmation(false);
  };

  const handleBackToSampleSelection = () => {
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Protrace</h1>
          <button
            onClick={handleRestartClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 1 && '1 · Upload Raw Data'}
              {currentStep === 2 && '2 · Select Samples'}
              {currentStep >= 3 && '3 · Generate Plot'}
            </h2>
            {currentStep > 1 && (
              <button
                onClick={handleBackStep}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentStep === 1 ? 20 : currentStep === 2 ? 60 : 100}%` }}
            />
          </div>
        </div>

        {/* Upload Section */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            
            {/* File Info */}
            {uploadedFile && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        File uploaded successfully
                      </p>
                      <p className="text-sm text-green-700">
                        {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to Sample Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample Selection */}
        {currentStep === 2 && (
          <SampleSelection onContinue={handleSampleSelection} />
        )}

        {/* Plot Generation */}
        {currentStep === 3 && (
          <PlotGeneration
            samples={samples}
            uploadedFile={uploadedFile}
            onBack={handleBackToSampleSelection}
          />
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRestartConfirmation}
        title="Restart Application"
        message="Are you sure you want to restart? All your progress will be lost and you'll need to start over from the beginning."
        confirmText="Yes, Restart"
        cancelText="Cancel"
        onConfirm={handleRestartConfirm}
        onCancel={handleRestartCancel}
      />
    </div>
  );
} 