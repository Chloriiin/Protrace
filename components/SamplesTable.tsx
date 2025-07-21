'use client';

import { useState } from 'react';
import { Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';
import { Sample } from './SampleForm';

interface SamplesTableProps {
  samples: Sample[];
  onUpdateSample: (id: string, sample: Omit<Sample, 'id'>) => void;
  onDeleteSample: (id: string) => void;
  onReorderSamples: (samples: Sample[]) => void;
  onHoverSample?: (sample: Sample | null) => void;
}

export default function SamplesTable({ 
  samples, 
  onUpdateSample, 
  onDeleteSample, 
  onReorderSamples,
  onHoverSample 
}: SamplesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredSample, setHoveredSample] = useState<Sample | null>(null);

  const handleEditStart = (sample: Sample) => {
    setEditingId(sample.id);
    setEditName(sample.sampleName);
  };

  const handleEditSave = (sample: Sample) => {
    if (editName.trim()) {
      onUpdateSample(sample.id, {
        ...sample,
        sampleName: editName.trim()
      });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sample?')) {
      onDeleteSample(id);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSamples = [...samples];
    const draggedSample = newSamples[draggedIndex];
    
    // Remove dragged item
    newSamples.splice(draggedIndex, 1);
    
    // Insert at new position
    newSamples.splice(dropIndex, 0, draggedSample);
    
    onReorderSamples(newSamples);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRowHover = (sample: Sample | null) => {
    setHoveredSample(sample);
    if (onHoverSample) {
      onHoverSample(sample);
    }
  };

  if (samples.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 shadow-sm">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No samples added yet</div>
          <div className="text-sm">Use the plate above to select wells and add samples</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h4 className="text-lg font-semibold text-gray-900">
          Samples ({samples.length})
        </h4>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Background Well
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample Wells
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {samples.map((sample, index) => (
              <tr 
                key={sample.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${hoveredSample?.id === sample.id ? 'bg-blue-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => handleRowHover(sample)}
                onMouseLeave={() => handleRowHover(null)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move mr-2" />
                    <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingId === sample.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(sample)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {sample.sampleName}
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  {sample.backgroundWell ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-gray-900 rounded-full"></span>
                      <span className="text-sm text-gray-900">{sample.backgroundWell}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </td>
                
                <td className="px-4 py-4">
                  {sample.sampleWells.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-gray-600 rounded-full"></span>
                      <span className="text-sm text-gray-900">
                        {sample.sampleWells.join(', ')}
                        {sample.sampleWells.length > 1 && (
                          <span className="text-gray-500"> ({sample.sampleWells.length} wells)</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditStart(sample)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Edit sample name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sample.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete sample"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 