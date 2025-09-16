import React, { useState, useEffect } from 'react';
import API_BASE from '../apiConfig';

const ProjectDetailsModal = ({ submission, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine primary file with additional screenshots
  // Handle cases where additional_screenshots might be undefined or not an array
  const allFiles = [
    ...(submission.screenshot_path ? [{path: submission.screenshot_path, isPrimary: true}] : []),
    ...((submission.additional_screenshots && Array.isArray(submission.additional_screenshots)) 
        ? submission.additional_screenshots.map(screenshot => ({path: screenshot, isPrimary: false}))
        : [])
  ];
  
  const getFileType = (filePath) => {
    if (!filePath) return 'unknown';
    if (filePath.includes('screenshot')) return 'screenshot';
    if (filePath.includes('project')) return 'project';
    return 'file';
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const nextImage = () => {
    // Navigate through all files
    if (allFiles.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allFiles.length);
    }
  };
  
  const prevImage = () => {
    // Navigate through all files
    if (allFiles.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allFiles.length) % allFiles.length);
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allFiles.length]);
  
  // Auto-advance through all files every 3 seconds
  useEffect(() => {
    if (allFiles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allFiles.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [allFiles.length]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{submission.lumen_name}</h2>
              <p className="text-gray-600 mt-1">Submitted on {formatDate(submission.timestamp)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Media Section */}
            <div>
              {allFiles.length > 0 ? (
                <div className="space-y-4">
                  {/* Main File Display */}
                  <div className="relative">
                    {getFileType(allFiles[currentImageIndex].path) === 'screenshot' ? (
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={`${API_BASE}/${allFiles[currentImageIndex].path}`} 
                          alt={`Screenshot ${currentImageIndex + 1}`}
                          className="w-full h-96 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-900">
                          {allFiles[currentImageIndex].isPrimary ? 'Primary Project ZIP File' : 'Additional Project ZIP File'}
                        </p>
                        <a 
                          href={`${API_BASE}/${allFiles[currentImageIndex].path}`} 
                          download={getFileType(allFiles[currentImageIndex].path) === 'project' ? true : undefined}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Project
                        </a>
                      </div>
                    )}
                    
                    {/* Navigation Arrows (if multiple images) */}
                    {allFiles.filter(file => getFileType(file.path) === 'screenshot').length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                        >
                          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                        >
                          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {allFiles.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto py-2">
                      {allFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {getFileType(file.path) === 'screenshot' ? (
                            <img 
                              src={`${API_BASE}/${file.path}`} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-1">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs text-gray-500 mt-1">ZIP</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* File Counter */}
                  {allFiles.length > 1 && (
                    <div className="text-center text-sm text-gray-500">
                      {currentImageIndex + 1} of {allFiles.length} files
                      {allFiles.filter(file => getFileType(file.path) === 'screenshot').length > 1 && (
                        <div className="mt-1 text-xs text-gray-400">
                          Use arrow keys or click arrows to navigate
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500">No files available</p>
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div>
              <div className="space-y-6">
                {/* Project Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Model:</span>
                      <span className="font-medium">{submission.ai_used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Tool:</span>
                      <span className="font-medium">{submission.ai_agent || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reward:</span>
                      <span className="font-medium text-green-600">{formatCurrency(submission.reward_amount)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Prompt */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prompt Used</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.prompt_text}</p>
                  </div>
                </div>
                
                {/* Download Options */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Files</h3>
                  <div className="space-y-3">
                    {allFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getFileType(file.path) === 'screenshot' ? (
                            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {getFileType(file.path) === 'screenshot' 
                              ? (file.isPrimary ? `Primary Screenshot` : `Additional Screenshot ${index}`)
                              : (file.isPrimary ? `Primary Project ZIP File` : `Additional Project ZIP File ${index}`)}
                          </span>
                        </div>
                        <a 
                          href={`${API_BASE}/${file.path}`} 
                          download={getFileType(file.path) === 'project' ? true : `screenshot-${index + 1}.jpg`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;