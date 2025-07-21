import { Sample } from '@/components/SampleForm';

export interface SampleExportData {
  version: string;
  exportDate: string;
  plateType: string;
  applicationName: string;
  samples: Sample[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: SampleExportData;
}

/**
 * Export samples to a downloadable JSON file
 */
export const exportSamples = (samples: Sample[]): void => {
  const exportData: SampleExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    plateType: '96-well',
    applicationName: 'Protrace',
    samples: samples
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `protrace-samples-${timestamp}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
};

/**
 * Validate imported sample file
 */
export const validateSampleFile = (fileContent: string): ValidationResult => {
  try {
    const data = JSON.parse(fileContent) as SampleExportData;
    
    // Check required fields
    if (!data.version) {
      return { isValid: false, error: 'Missing version information' };
    }
    
    if (!data.samples || !Array.isArray(data.samples)) {
      return { isValid: false, error: 'Invalid or missing samples data' };
    }
    
    if (data.plateType !== '96-well') {
      return { isValid: false, error: `Unsupported plate type: ${data.plateType}. Only 96-well plates are supported.` };
    }
    
    // Validate each sample
    for (const sample of data.samples) {
      if (!sample.id || !sample.sampleName) {
        return { isValid: false, error: 'Invalid sample data: missing id or sampleName' };
      }
      
      if (sample.backgroundWell && typeof sample.backgroundWell !== 'string') {
        return { isValid: false, error: 'Invalid background well format' };
      }
      
      if (!Array.isArray(sample.sampleWells)) {
        return { isValid: false, error: 'Invalid sample wells format' };
      }
      
      // Validate well IDs format (A1-H12)
      const wellPattern = /^[A-H]([1-9]|1[0-2])$/;
      
      if (sample.backgroundWell && !wellPattern.test(sample.backgroundWell)) {
        return { isValid: false, error: `Invalid background well format: ${sample.backgroundWell}` };
      }
      
      for (const well of sample.sampleWells) {
        if (!wellPattern.test(well)) {
          return { isValid: false, error: `Invalid sample well format: ${well}` };
        }
      }
    }
    
    return { isValid: true, data };
    
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
};

/**
 * Import samples from file content
 */
export const importSamples = (fileContent: string): Promise<Sample[]> => {
  return new Promise((resolve, reject) => {
    const validation = validateSampleFile(fileContent);
    
    if (!validation.isValid || !validation.data) {
      reject(new Error(validation.error || 'Invalid file format'));
      return;
    }
    
    // Generate new IDs to avoid conflicts
    const importedSamples: Sample[] = validation.data.samples.map(sample => ({
      ...sample,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    
    resolve(importedSamples);
  });
}; 