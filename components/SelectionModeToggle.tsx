'use client';

interface SelectionModeToggleProps {
  selectionMode: 'background' | 'sample';
  onModeChange: (mode: 'background' | 'sample') => void;
}

export default function SelectionModeToggle({ 
  selectionMode, 
  onModeChange 
}: SelectionModeToggleProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gray-100 rounded-lg p-1 flex">
        <button
          onClick={() => onModeChange('background')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectionMode === 'background'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-gray-900 rounded-full"></span>
            Background Wells
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('sample')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectionMode === 'sample'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-gray-600 rounded-full"></span>
            Sample Wells
          </div>
        </button>
      </div>
    </div>
  );
} 