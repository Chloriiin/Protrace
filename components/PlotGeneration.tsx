'use client';

import { useState, useEffect } from 'react';
import { Sample } from './SampleForm';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';

interface PlotGenerationProps {
  samples: Sample[];
  uploadedFile: File | null;
  onBack: () => void;
}

interface PlotSettings {
  font: string;
  width: number;
  title: string;
  subtitle: string;
  yLabel: string;
}

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Palatino', label: 'Palatino' },
];

export default function PlotGeneration({ samples, uploadedFile, onBack }: PlotGenerationProps) {
  const [settings, setSettings] = useState<PlotSettings>({
    font: 'Arial',
    width: 9,
    title: '',
    subtitle: '',
    yLabel: 'A₃₅₀',
  });

  const [plotImageUrl, setPlotImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pyScriptReady, setPyScriptReady] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

    useEffect(() => {
    // Check if Python backend is available
    const checkBackend = async () => {
      try {
        // Check if we're running in Tauri
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          console.log('Running in Tauri, starting embedded Python backend...');
          
          // Dynamic import to avoid SSR issues
          const { invoke } = await import('@tauri-apps/api/tauri');
          
          try {
            const result = await invoke('start_python_backend');
            console.log('Tauri backend start result:', result);
            
            // Wait a moment for the backend to start, then test connection
            setTimeout(async () => {
              try {
                const response = await fetch('http://localhost:5001/health');
                const healthResult = await response.json();
                if (healthResult.status === 'healthy') {
                  setPyScriptReady(true);
                  console.log('Embedded Python backend is ready!');
                }
              } catch (e) {
                console.log('Backend starting, will retry...');
                // Retry after another delay
                setTimeout(async () => {
                  try {
                    const response = await fetch('http://localhost:5001/health');
                    const healthResult = await response.json();
                    if (healthResult.status === 'healthy') {
                      setPyScriptReady(true);
                      console.log('Embedded Python backend is ready!');
                    }
                  } catch (retryError) {
                    console.error('Failed to connect to embedded backend after retries');
                  }
                }, 3000);
              }
            }, 2000);
            
          } catch (tauriError) {
            console.error('Failed to start embedded Python backend:', tauriError);
          }
        } else {
          // Development mode - check localhost backend
          console.log('Checking Python backend on localhost...');
          const response = await fetch('http://localhost:5001/health');
          const result = await response.json();
          
          if (result.status === 'healthy') {
            setPyScriptReady(true);
            console.log('Python backend is ready!');
          } else {
            console.log('Python backend is not healthy');
          }
        }
      } catch (error) {
        console.log('Python backend is not running on localhost:5001');
        console.log('Please start the Python backend server');
      }
    };

    checkBackend();
  }, []);

  const handleSettingChange = (field: keyof PlotSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    if (!uploadedFile || samples.length === 0) {
      alert('Please ensure you have uploaded a file and selected samples.');
      return;
    }

    // Validate required fields
    if (!settings.title.trim() || !settings.subtitle.trim() || !settings.yLabel.trim()) {
      alert('Please fill in all required fields (title, subtitle, y-label).');
      return;
    }

    setIsGenerating(true);
    try {
      // Convert file to base64 using FileReader (more reliable for large files)
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,)
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });
      
      // Prepare data for Python backend
      const samplesConfig = samples.map(sample => ({
        sampleName: sample.sampleName,
        backgroundWell: sample.backgroundWell,
        sampleWells: sample.sampleWells
      }));
      
      console.log('Generating plot with settings:', settings);
      console.log('Samples:', samplesConfig);
      console.log('File:', uploadedFile.name, 'Size:', uploadedFile.size, 'bytes');
      
      // Call the Python backend API
      const response = await fetch('http://localhost:5001/generate-plot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: fileBase64,
          samplesConfig: samplesConfig,
          plotSettings: settings
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPlotImageUrl(result.imageUrl);
        console.log('Plot generated successfully');
      } else {
        throw new Error(result.error || 'Failed to generate plot');
      }
      
    } catch (error) {
      console.error('Error generating plot:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Error: Could not connect to Python backend. Please make sure the Python server is running on http://localhost:5001');
      } else {
        alert(`Error generating plot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPlot = async (format: string) => {
    if (!uploadedFile || samples.length === 0 || !settings.title.trim() || !settings.subtitle.trim() || !settings.yLabel.trim()) {
      alert('Please ensure you have uploaded a file, selected samples, and filled in all plot settings.');
      return;
    }
    setExportingFormat(format);
    try {
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });
      const samplesConfig = samples.map(sample => ({
        sampleName: sample.sampleName,
        backgroundWell: sample.backgroundWell,
        sampleWells: sample.sampleWells
      }));
      // Call backend for export
      const response = await fetch('http://localhost:5001/generate-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileBase64,
          samplesConfig: samplesConfig,
          plotSettings: settings,
          exportFormat: format
        })
      });
      const result = await response.json();
      if (result.success && result.imageUrl) {
        // Download the image in the correct format
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `protrace_plot.${format === 'jpg' ? 'jpg' : format}`;
        link.click();
      } else {
        alert(result.error || `Failed to export plot as ${format.toUpperCase()}`);
      }
    } catch (error) {
      alert(`Error exporting plot as ${format.toUpperCase()}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const isFormValid = settings.title.trim() && settings.subtitle.trim() && settings.yLabel.trim() && settings.width > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Plot Generation</h1>
        <p className="text-gray-600">
          Configure your plot settings and generate the visualization for your {samples.length} samples.
        </p>
      </div>

      {/* Change layout from grid to flex-col for vertical stacking */}
      <div className="flex flex-col gap-8">
        {/* Plot Display - move to top */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generated Plot</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
            {plotImageUrl ? (
              <img 
                src={plotImageUrl} 
                alt="Generated plot"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Configure settings and click "Generate Plot" to see your visualization</p>
              </div>
            )}
          </div>
          {/* Export Button and Format Dropdown */}
          {plotImageUrl && (
            <div className="mt-6 flex flex-col items-center">
              <label className="mb-2 text-sm font-medium text-gray-700">Export Plot As:</label>
              <div className="flex gap-3">
                {['png', 'svg', 'pdf', 'jpg'].map((fmt) => (
                  <button
                    key={fmt}
                    className={`px-4 py-2 rounded-md font-medium ${exportingFormat === fmt ? 'bg-blue-300 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    onClick={() => downloadPlot(fmt)}
                    disabled={!!exportingFormat}
                  >
                    {exportingFormat === fmt ? 'Exporting...' : fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Choose a format to export your plot.</p>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Plot Settings</h2>
            
            <div className="space-y-4">
              {/* Font Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font
                </label>
                <select
                  value={settings.font}
                  onChange={(e) => handleSettingChange('font', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Figure Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figure Width
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.width}
                  onChange={(e) => handleSettingChange('width', parseInt(e.target.value) || 9)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9"
                />
                <p className="text-sm text-gray-500 mt-1">Height is fixed at 5</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleSettingChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plot title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plot subtitle"
                />
              </div>

              {/* Y-Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.yLabel}
                  onChange={(e) => handleSettingChange('yLabel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A₃₅₀"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!isFormValid || isGenerating || !pyScriptReady}
              className={`w-full mt-6 py-3 px-4 rounded-md font-medium ${
                isFormValid && !isGenerating && pyScriptReady
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!pyScriptReady ? 'Connecting to Python Backend...' : isGenerating ? 'Generating...' : 'Generate Plot'}
            </button>
          </div>

          {/* Sample Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Sample Summary</h3>
            <p className="text-sm text-gray-600 mb-2">
              {samples.length} samples selected from {uploadedFile?.name}
            </p>
            <div className="space-y-1">
              {samples.map((sample, index) => (
                <div key={sample.id} className="text-xs text-gray-500">
                  {index + 1}. {sample.sampleName} 
                  ({sample.backgroundWell ? `BG: ${sample.backgroundWell}, ` : ''}
                  Sample: {sample.sampleWells.join(', ')})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 