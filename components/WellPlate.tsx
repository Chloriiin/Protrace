'use client';

import { useState, useCallback, useEffect } from 'react';
import { Sample } from './SampleForm';
import { Trash2 } from 'lucide-react';

export interface WellData {
  id: string;
  row: string;
  col: number;
  type: 'background' | 'sample' | 'none';
  sampleName?: string;
}

interface WellPlateProps {
  selectedWells: WellData[];
  onWellClick: (wellId: string) => void;
  selectionMode: 'background' | 'sample';
  currentSampleName?: string;
  highlightedSample?: Sample | null;
  onClearPlate?: () => void;
}

export default function WellPlate({ 
  selectedWells, 
  onWellClick, 
  selectionMode,
  currentSampleName,
  highlightedSample,
  onClearPlate 
}: WellPlateProps) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartWell, setDragStartWell] = useState<string | null>(null);
  const [draggedWells, setDraggedWells] = useState<Set<string>>(new Set());
  const [hasDraggedToOtherWells, setHasDraggedToOtherWells] = useState(false);

  const getWellData = useCallback((wellId: string): WellData | undefined => {
    return selectedWells.find(well => well.id === wellId);
  }, [selectedWells]);

  const getWellStyle = useCallback((wellId: string) => {
    const wellData = getWellData(wellId);
    
    // Check if this well is part of the highlighted sample
    const isHighlighted = highlightedSample && (
      wellId === highlightedSample.backgroundWell || 
      highlightedSample.sampleWells.includes(wellId)
    );
    
    // Check if this well is being dragged over
    const isDraggedOver = draggedWells.has(wellId);
    
    if (!wellData || wellData.type === 'none') {
      if (isDraggedOver) {
        return 'bg-blue-200 border-2 border-blue-400 hover:bg-blue-300';
      }
      if (isHighlighted) {
        return 'bg-yellow-100 border-2 border-yellow-400 hover:bg-yellow-200';
      }
      return 'bg-white border border-gray-300 hover:bg-gray-50';
    }
    
    if (wellData.type === 'background') {
      if (isHighlighted) {
        return 'bg-gray-900 text-white border-2 border-yellow-400 ring-2 ring-yellow-400';
      }
      return 'bg-gray-900 text-white border border-gray-900';
    }
    
    if (wellData.type === 'sample') {
      if (isDraggedOver) {
        return 'bg-blue-600 text-white border-2 border-blue-400 ring-2 ring-blue-400';
      }
      if (isHighlighted) {
        return 'bg-gray-600 text-white border-2 border-yellow-400 ring-2 ring-yellow-400';
      }
      return 'bg-gray-600 text-white border border-gray-600';
    }
    
    return 'bg-white border border-gray-300 hover:bg-gray-50';
  }, [getWellData, highlightedSample, draggedWells]);

  const handleMouseDown = useCallback((e: React.MouseEvent, wellId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartWell(wellId);
    setDraggedWells(new Set([wellId]));
    setHasDraggedToOtherWells(false);
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseEnter = useCallback((wellId: string) => {
    if (isDragging && selectionMode === 'sample') {
      setDraggedWells(prev => new Set([...Array.from(prev), wellId]));
      // Mark that we've dragged to other wells if this is not the start well
      if (wellId !== dragStartWell) {
        setHasDraggedToOtherWells(true);
      }
    }
  }, [isDragging, selectionMode, dragStartWell]);

    const handleMouseUp = useCallback(() => {
    if (isDragging) {
      if (selectionMode === 'sample' && hasDraggedToOtherWells) {
        // This was a drag operation - apply all dragged wells as selections
        Array.from(draggedWells).forEach(wellId => {
          onWellClick(wellId);
        });
      } else {
        // This was a single click (or background mode) - just click the start well
        if (dragStartWell) {
          onWellClick(dragStartWell);
        }
      }
    }
    
    setIsDragging(false);
    setDragStartWell(null);
    setDraggedWells(new Set());
    setHasDraggedToOtherWells(false);
    
    // Restore text selection
    document.body.style.userSelect = '';
  }, [isDragging, selectionMode, draggedWells, onWellClick, hasDraggedToOtherWells, dragStartWell]);

  // Global mouse up handler to handle cases where user releases mouse outside the plate
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseUp]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plate Header */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">96-Well Plate</h3>
          {onClearPlate && (
            <button
              onClick={onClearPlate}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              title="Clear all selections"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Mode: <span className="font-medium">
            {selectionMode === 'background' ? 'Background Well' : 'Sample Wells'}
          </span>
          {currentSampleName && (
            <span className="ml-2">
              for "<span className="font-medium">{currentSampleName}</span>"
            </span>
          )}
        </p>
        {/* Fixed height container to prevent layout shift */}
        <div className="h-4 mt-1">
          {selectionMode === 'sample' && !isDragging && (
            <p className="text-xs text-gray-500">
              Click and drag to select multiple wells
            </p>
          )}
          {isDragging && (
            <p className="text-xs text-blue-600 font-medium">
              Drag Selection Active
            </p>
          )}
        </div>
      </div>

      {/* Plate Grid */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
        {/* Column Headers */}
        <div className="grid grid-cols-13 gap-1 mb-2">
          <div className="w-8"></div> {/* Empty corner - match well width */}
          {cols.map(col => (
            <div key={col} className="w-8 text-center text-xs font-medium text-gray-500 py-1 flex items-center justify-center">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map(row => (
          <div key={row} className="grid grid-cols-13 gap-1 mb-1">
            {/* Row Header */}
            <div className="w-8 text-center text-xs font-medium text-gray-500 py-2 flex items-center justify-center">
              {row}
            </div>
            
            {/* Wells */}
            {cols.map(col => {
              const wellId = `${row}${col}`;
              const wellData = getWellData(wellId);
              
              return (
                <button
                  key={wellId}
                  onMouseDown={(e) => handleMouseDown(e, wellId)}
                  onMouseEnter={() => handleMouseEnter(wellId)}
                  onMouseUp={handleMouseUp}
                  className={`
                    w-8 h-8 rounded-full text-xs font-medium transition-colors
                    ${getWellStyle(wellId)}
                    hover:scale-105 active:scale-95
                    ${isDragging ? 'cursor-crosshair' : 'cursor-pointer'}
                  `}
                  title={`${wellId}${wellData?.sampleName ? ` - ${wellData.sampleName}` : ''}`}
                >
                  {wellData?.type === 'background' ? 'B' : 
                   wellData?.type === 'sample' ? 'S' : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
          <span className="text-sm text-gray-600">Empty</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-900"></div>
          <span className="text-sm text-gray-600">Background</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-600"></div>
          <span className="text-sm text-gray-600">Sample</span>
        </div>
      </div>
    </div>
  );
} 