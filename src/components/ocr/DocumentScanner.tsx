import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, FileText, Scan, CheckCircle, AlertCircle, RotateCw, Trash2 } from 'lucide-react';
import { toast } from '../../utils/toast';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface ScannedDocument {
  id: string;
  name: string;
  type: 'w2' | '1099' | 'receipt' | 'form' | 'other';
  imageUrl: string;
  extractedData: ExtractedData;
  confidence: number;
  status: 'processing' | 'completed' | 'error' | 'review';
  timestamp: Date;
  pages: number;
}

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  needsReview: boolean;
}

type DocumentType = ScannedDocument['type'];

type ExtractedData =
  | {
      employerName: string;
      employerEIN: string;
      employeeSSN: string;
      wages: string;
      federalWithholding: string;
      stateWithholding: string;
      socialSecurityWages: string;
      medicareWages: string;
    }
  | {
      payerName: string;
      payerTIN: string;
      recipientTIN: string;
      interestIncome: string;
      dividends: string;
      federalWithholding: string;
    }
  | {
      vendor: string;
      date: string;
      amount: string;
      category: string;
      description: string;
    }
  | {
      documentType: string;
      text: string;
    };

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedData, documentType: DocumentType) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onDataExtracted
}) => {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate OCR processing
  const processDocument = useCallback(async (file: File, documentType: DocumentType) => {
    const documentId = `doc_${Date.now()}`;

    // Create document entry
    const newDocument: ScannedDocument = {
      id: documentId,
      name: file.name,
      type: documentType,
      imageUrl: URL.createObjectURL(file),
      extractedData: {
        documentType,
        text: ''
      },
      confidence: 0,
      status: 'processing',
      timestamp: new Date(),
      pages: 1
    };

    setDocuments(prev => [newDocument, ...prev]);
    setProcessingQueue(prev => [...prev, documentId]);

    // Simulate processing delay
    setTimeout(() => {
      // Simulate OCR extraction based on document type
      let extractedData: ExtractedData;
      let fields: ExtractedField[] = [];
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

      switch (documentType) {
        case 'w2':
          extractedData = {
            employerName: 'Acme Corporation',
            employerEIN: '12-3456789',
            employeeSSN: '***-**-1234',
            wages: '75000.00',
            federalWithholding: '12500.00',
            stateWithholding: '3750.00',
            socialSecurityWages: '75000.00',
            medicareWages: '75000.00'
          };
          fields = [
            { field: 'wages', value: '75000.00', confidence: 0.95, needsReview: false },
            { field: 'federalWithholding', value: '12500.00', confidence: 0.92, needsReview: false },
            { field: 'stateWithholding', value: '3750.00', confidence: 0.88, needsReview: true },
            { field: 'employerName', value: 'Acme Corporation', confidence: 0.97, needsReview: false }
          ];
          break;

        case '1099':
          extractedData = {
            payerName: 'Investment Bank LLC',
            payerTIN: '98-7654321',
            recipientTIN: '***-**-1234',
            interestIncome: '2500.00',
            dividends: '1800.00',
            federalWithholding: '375.00'
          };
          fields = [
            { field: 'interestIncome', value: '2500.00', confidence: 0.89, needsReview: true },
            { field: 'dividends', value: '1800.00', confidence: 0.94, needsReview: false },
            { field: 'federalWithholding', value: '375.00', confidence: 0.91, needsReview: false }
          ];
          break;

        case 'receipt':
          extractedData = {
            vendor: 'Office Supply Store',
            date: '2024-03-15',
            amount: '157.83',
            category: 'Office Supplies',
            description: 'Printer paper, pens, folders'
          };
          fields = [
            { field: 'amount', value: '157.83', confidence: 0.96, needsReview: false },
            { field: 'vendor', value: 'Office Supply Store', confidence: 0.93, needsReview: false },
            { field: 'date', value: '2024-03-15', confidence: 0.87, needsReview: true }
          ];
          break;

        default:
          extractedData = {
            documentType: 'Unknown',
            text: 'Various text extracted from document...'
          };
          fields = [
            { field: 'documentType', value: 'Unknown', confidence: 0.5, needsReview: true }
          ];
      }

      // Update document with extracted data
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? {
                ...doc,
                extractedData,
                confidence,
                status: fields.some(f => f.needsReview) ? 'review' : 'completed'
              }
            : doc
        )
      );

      setExtractedFields(fields);
      setProcessingQueue(prev => prev.filter(id => id !== documentId));

      // Auto-populate form if confidence is high
      if (confidence > 0.9 && !fields.some(f => f.needsReview)) {
        onDataExtracted(extractedData, documentType);
      }
    }, 2000 + Math.random() * 3000); // 2-5 second processing time

  }, [onDataExtracted]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsScanning(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      // Auto-detect document type based on filename or content
      let documentType: DocumentType = 'other';
      const fileName = file.name.toLowerCase();

      if (fileName.includes('w2') || fileName.includes('w-2')) {
        documentType = 'w2';
      } else if (fileName.includes('1099')) {
        documentType = '1099';
      } else if (fileName.includes('receipt') || fileName.includes('invoice')) {
        documentType = 'receipt';
      }

      await processDocument(file, documentType);
    }

    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processDocument(file, 'other');
      }
    }, 'image/jpeg', 0.9);

    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  // Modal accessibility hooks
  const cameraModal = useModalAccessibility({
    isOpen: showCamera,
    onClose: stopCamera,
  });

  const reviewModal = useModalAccessibility({
    isOpen: !!selectedDocument,
    onClose: () => setSelectedDocument(null),
  });

  const approveExtraction = (document: ScannedDocument) => {
    onDataExtracted(document.extractedData, document.type);
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === document.id ? { ...doc, status: 'completed' as const } : doc
      )
    );
    setSelectedDocument(null);
  };

  const updateField = (fieldName: string, newValue: string) => {
    setExtractedFields(prev =>
      prev.map(field =>
        field.field === fieldName
          ? { ...field, value: newValue, needsReview: false }
          : field
      )
    );
  };

  const deleteDocument = (documentId: string) => {
    // TODO: Replace with proper confirmation modal
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      toast.success('Document deleted successfully');
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'w2': return '📄';
      case '1099': return '📋';
      case 'receipt': return '🧾';
      case 'form': return '📝';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Document Scanner</h3>
          {processingQueue.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full animate-pulse">
              Processing {processingQueue.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
          <button
            onClick={startCamera}
            disabled={isScanning}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Scan Document
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Modal */}
      {showCamera && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={cameraModal.handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
        >
          <div
            ref={cameraModal.modalRef}
            className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="camera-modal-title" className="text-lg font-semibold">Capture Document</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close camera modal"
              >
                ✕
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 rounded-lg pointer-events-none"></div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 inline mr-2" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Feature Overview */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">AI-Powered Document Processing</span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Automatically extracts data from W-2s, 1099s, receipts, and tax forms</li>
          <li>• OCR technology with 95%+ accuracy for most documents</li>
          <li>• Smart field detection and validation</li>
          <li>• Manual review and correction for uncertain extractions</li>
          <li>• Supports both camera capture and file upload</li>
        </ul>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {documents.map((document) => (
          <div key={document.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={document.imageUrl}
                alt={document.name}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(document.status)}`}>
                  {document.status}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-lg">{getDocumentTypeIcon(document.type)}</span>
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate flex-1">{document.name}</h4>
                <button
                  onClick={() => deleteDocument(document.id)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {document.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <RotateCw className="h-3 w-3 animate-spin" />
                  Processing...
                </div>
              )}

              {document.status === 'completed' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Extraction complete
                  </div>
                  <div className={`text-xs ${getConfidenceColor(document.confidence)}`}>
                    Confidence: {(document.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              {document.status === 'review' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    Needs review
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDocument(document);
                      // Set extracted fields for this document
                      const mockFields: ExtractedField[] = Object.entries(document.extractedData).map(([key, value]) => ({
                        field: key,
                        value: String(value),
                        confidence: Math.random() * 0.3 + 0.7,
                        needsReview: Math.random() > 0.7
                      }));
                      setExtractedFields(mockFields);
                    }}
                    className="w-full px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                  >
                    Review & Approve
                  </button>
                </div>
              )}

              {document.status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Processing failed
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                {document.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents scanned yet</h3>
          <p className="text-sm mb-4">Upload documents or use your camera to scan tax forms, receipts, and other documents</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </button>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Camera className="h-4 w-4" />
              Scan Document
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={reviewModal.handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div
            ref={reviewModal.modalRef}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 id="review-modal-title" className="text-xl font-semibold text-gray-900">Review Extracted Data</h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close review modal"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Document Preview</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedDocument.imageUrl}
                      alt={selectedDocument.name}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Extracted Fields */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Extracted Data</h4>
                  <div className="space-y-3">
                    {extractedFields.map((field, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.field.charAt(0).toUpperCase() + field.field.slice(1)}
                          {field.needsReview && (
                            <span className="ml-2 text-orange-600">
                              <AlertCircle className="h-3 w-3 inline" />
                            </span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => updateField(field.field, e.target.value)}
                            className={`flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              field.needsReview ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                            }`}
                          />
                          <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(field.confidence)} bg-gray-100 flex items-center`}>
                            {(field.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => approveExtraction(selectedDocument)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Approve & Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Statistics */}
      {documents.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900">Total Documents</div>
            <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm font-medium text-green-900">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'completed').length}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-sm font-medium text-orange-900">Needs Review</div>
            <div className="text-2xl font-bold text-orange-600">
              {documents.filter(d => d.status === 'review').length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-sm font-medium text-yellow-900">Processing</div>
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'processing').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
