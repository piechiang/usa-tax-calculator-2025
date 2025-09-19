import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Camera, Scan, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, FileJson, FileImage, Calendar } from 'lucide-react';

interface ImportSource {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  supportedFormats: string[];
  isAvailable: boolean;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fileExtension: string;
}

interface ImportProgress {
  stage: 'uploading' | 'processing' | 'mapping' | 'validating' | 'complete' | 'error';
  progress: number;
  message: string;
  errors?: string[];
}

interface DataImportExportProps {
  onImport: (data: any) => void;
  onExport: (format: string) => Promise<void>;
  currentData: any;
  t: (key: string) => string;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({
  onImport,
  onExport,
  currentData,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedImportSource, setSelectedImportSource] = useState<string>('');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [priorYearData, setPriorYearData] = useState<any>(null);
  const [documentScanResult, setDocumentScanResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const importSources: ImportSource[] = [
    {
      id: 'previous-year',
      name: 'Previous Year Tax Return',
      description: 'Import personal information and carryover data from last year\'s return',
      icon: Calendar,
      supportedFormats: ['JSON', 'PDF'],
      isAvailable: true
    },
    {
      id: 'csv-file',
      name: 'CSV Spreadsheet',
      description: 'Import data from a CSV file with tax information',
      icon: FileSpreadsheet,
      supportedFormats: ['CSV'],
      isAvailable: true
    },
    {
      id: 'json-file',
      name: 'JSON Data File',
      description: 'Import structured tax data from a JSON file',
      icon: FileJson,
      supportedFormats: ['JSON'],
      isAvailable: true
    },
    {
      id: 'document-scan',
      name: 'Document Scanner',
      description: 'Scan W-2s, 1099s, and other tax documents with OCR',
      icon: Camera,
      supportedFormats: ['PDF', 'JPG', 'PNG'],
      isAvailable: true
    },
    {
      id: 'bank-import',
      name: 'Bank Statement Import',
      description: 'Import transactions from bank statements (CSV/OFX)',
      icon: FileText,
      supportedFormats: ['CSV', 'OFX', 'QFX'],
      isAvailable: false // Feature coming soon
    },
    {
      id: 'third-party',
      name: 'Third-Party Software',
      description: 'Import from TurboTax, H&R Block, or other tax software',
      icon: Upload,
      supportedFormats: ['Various'],
      isAvailable: false // Feature coming soon
    }
  ];

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf-summary',
      name: 'PDF Tax Summary',
      description: 'Complete tax calculation summary ready for filing',
      icon: FileText,
      fileExtension: 'pdf'
    },
    {
      id: 'json-backup',
      name: 'JSON Backup',
      description: 'Complete backup of all tax data for future use',
      icon: FileJson,
      fileExtension: 'json'
    },
    {
      id: 'csv-data',
      name: 'CSV Data Export',
      description: 'Spreadsheet-friendly format for analysis',
      icon: FileSpreadsheet,
      fileExtension: 'csv'
    },
    {
      id: 'tax-preparer',
      name: 'Tax Preparer Package',
      description: 'Professional package for CPA or tax preparer review',
      icon: FileText,
      fileExtension: 'zip'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    processImportFile(file);
  };

  const processImportFile = async (file: File) => {
    setImportProgress({
      stage: 'uploading',
      progress: 0,
      message: 'Uploading file...'
    });

    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(prev => prev ? { ...prev, progress: i } : null);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportProgress({
        stage: 'processing',
        progress: 0,
        message: 'Processing file...'
      });

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: any = null;

      if (fileExtension === 'json') {
        const text = await file.text();
        parsedData = JSON.parse(text);
      } else if (fileExtension === 'csv') {
        const text = await file.text();
        parsedData = parseCSV(text);
      } else if (fileExtension === 'pdf') {
        // In a real implementation, you'd use a PDF parsing library
        parsedData = await parsePDF(file);
      }

      if (parsedData) {
        setImportProgress({
          stage: 'mapping',
          progress: 50,
          message: 'Mapping data fields...'
        });

        // Simulate field mapping
        await new Promise(resolve => setTimeout(resolve, 1000));

        setImportProgress({
          stage: 'validating',
          progress: 80,
          message: 'Validating data...'
        });

        // Validate imported data
        const validationErrors = validateImportedData(parsedData);

        if (validationErrors.length > 0) {
          setImportProgress({
            stage: 'error',
            progress: 100,
            message: 'Validation failed',
            errors: validationErrors
          });
          return;
        }

        setImportProgress({
          stage: 'complete',
          progress: 100,
          message: 'Import completed successfully!'
        });

        // Apply imported data
        onImport(parsedData);

        // Clear progress after success
        setTimeout(() => {
          setImportProgress(null);
          setUploadedFile(null);
        }, 2000);
      }
    } catch (error) {
      setImportProgress({
        stage: 'error',
        progress: 100,
        message: 'Import failed',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    }
  };

  const handleDocumentScan = () => {
    // Trigger camera/file input for document scanning
    cameraInputRef.current?.click();
  };

  const processCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportProgress({
      stage: 'processing',
      progress: 0,
      message: 'Scanning document...'
    });

    try {
      // Simulate OCR processing
      const ocrResults = await simulateOCR(file);

      setDocumentScanResult(ocrResults);

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Document scanned successfully!'
      });

      setTimeout(() => setImportProgress(null), 2000);
    } catch (error) {
      setImportProgress({
        stage: 'error',
        progress: 100,
        message: 'Document scan failed',
        errors: [error instanceof Error ? error.message : 'Scan failed']
      });
    }
  };

  const handleExport = async (formatId: string) => {
    try {
      await onExport(formatId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const importPreviousYear = () => {
    // Simulate previous year data import
    const samplePriorYearData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      },
      // Don't import SSN for security
      carryoverData: {
        capitalLossCarryover: 2500,
        charitableCarryover: 1000
      }
    };

    setPriorYearData(samplePriorYearData);
    onImport(samplePriorYearData);
  };

  const renderImportProgress = () => {
    if (!importProgress) return null;

    const getProgressIcon = () => {
      switch (importProgress.stage) {
        case 'complete':
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'error':
          return <AlertCircle className="w-5 h-5 text-red-600" />;
        default:
          return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      }
    };

    const getProgressColor = () => {
      switch (importProgress.stage) {
        case 'complete':
          return 'bg-green-600';
        case 'error':
          return 'bg-red-600';
        default:
          return 'bg-blue-600';
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          {getProgressIcon()}
          <span className="font-medium text-gray-900">{importProgress.message}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${importProgress.progress}%` }}
          />
        </div>

        {importProgress.errors && importProgress.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {importProgress.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentScanResult = () => {
    if (!documentScanResult) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900">Document Scanned Successfully</span>
        </div>

        <div className="space-y-2 text-sm">
          <div><strong>Document Type:</strong> {documentScanResult.type}</div>
          <div><strong>Confidence:</strong> {documentScanResult.confidence}%</div>
          <div><strong>Fields Extracted:</strong> {documentScanResult.fieldsCount}</div>
        </div>

        <button
          onClick={() => onImport(documentScanResult.data)}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Apply Scanned Data
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'import', label: 'Import Data', icon: Upload },
            { id: 'export', label: 'Export Data', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'import' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Tax Data</h3>
            <p className="text-gray-600 mb-6">
              Import your tax information from various sources to save time and reduce errors.
            </p>

            {renderImportProgress()}
            {renderDocumentScanResult()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importSources.map((source) => (
                <div
                  key={source.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedImportSource === source.id
                      ? 'border-blue-500 bg-blue-50'
                      : source.isAvailable
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => source.isAvailable && setSelectedImportSource(source.id)}
                >
                  <div className="flex items-start gap-3">
                    <source.icon className={`w-6 h-6 mt-1 ${
                      source.isAvailable ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        source.isAvailable ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {source.name}
                        {!source.isAvailable && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        source.isAvailable ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {source.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Supports: {source.supportedFormats.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedImportSource === source.id && source.isAvailable && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      {source.id === 'previous-year' && (
                        <button
                          onClick={importPreviousYear}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Import Previous Year Data
                        </button>
                      )}

                      {(source.id === 'csv-file' || source.id === 'json-file') && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={source.id === 'csv-file' ? '.csv' : '.json'}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Choose File
                          </button>
                        </>
                      )}

                      {source.id === 'document-scan' && (
                        <>
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            capture="environment"
                            onChange={processCameraCapture}
                            className="hidden"
                          />
                          <div className="space-y-2">
                            <button
                              onClick={handleDocumentScan}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              Scan Document
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              Supports W-2s, 1099s, and other tax documents
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Tax Data</h3>
            <p className="text-gray-600 mb-6">
              Export your tax information for filing, backup, or sharing with a tax professional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportFormats.map((format) => (
                <div
                  key={format.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <format.icon className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{format.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExport(format.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export {format.fileExtension.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>

            {/* Export Preview */}
            {currentData && Object.keys(currentData).length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Personal Information: {currentData.personalInfo ? 'Complete' : 'Incomplete'}</div>
                  <div>Income Data: {currentData.incomeData ? 'Complete' : 'Incomplete'}</div>
                  <div>Deductions: {currentData.deductions ? 'Complete' : 'Incomplete'}</div>
                  <div>Tax Calculations: {currentData.calculations ? 'Complete' : 'Not calculated'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const parseCSV = (csvText: string): any => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data: any = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      if (headers[j] && values[j]) {
        data[headers[j].trim()] = values[j].trim();
      }
    }
  }

  return data;
};

const parsePDF = async (file: File): Promise<any> => {
  // In a real implementation, you'd use a PDF parsing library like pdf-parse
  // For demo purposes, return mock data
  return {
    documentType: 'W-2',
    extractedData: {
      wages: 50000,
      federalWithholding: 5000,
      stateWithholding: 2000
    }
  };
};

const simulateOCR = async (file: File): Promise<any> => {
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    type: 'W-2',
    confidence: 95,
    fieldsCount: 8,
    data: {
      wages: 65000,
      federalWithholding: 8500,
      stateWithholding: 3200,
      socialSecurityWages: 65000,
      medicareWages: 65000
    }
  };
};

const validateImportedData = (data: any): string[] => {
  const errors: string[] = [];

  if (data.personalInfo) {
    if (!data.personalInfo.firstName) {
      errors.push('First name is required');
    }
    if (!data.personalInfo.lastName) {
      errors.push('Last name is required');
    }
    if (data.personalInfo.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(data.personalInfo.ssn)) {
      errors.push('Invalid SSN format');
    }
  }

  // Add more validation rules as needed

  return errors;
};

export default DataImportExport;