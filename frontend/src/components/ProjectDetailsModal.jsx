import React, { useState } from 'react';
import API_BASE from '../apiConfig';

const ProjectDetailsModal = ({ submission, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine primary screenshot with additional screenshots
  // Handle cases where additional_screenshots might be undefined or not an array
  const allScreenshots = [
    ...(submission.screenshot_path ? [submission.screenshot_path] : []),
    ...((submission.additional_screenshots && Array.isArray(submission.additional_screenshots)) 
        ? submission.additional_screenshots 
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
    if (allScreenshots.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allScreenshots.length);
    }
  };
  
  const prevImage = () => {
    if (allScreenshots.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allScreenshots.length) % allScreenshots.length);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              {allScreenshots.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image Display */}
                  <div className="relative">
                    {getFileType(allScreenshots[currentImageIndex]) === 'screenshot' ? (
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={`${API_BASE}/${allScreenshots[currentImageIndex]}`} 
                          alt={`Screenshot ${currentImageIndex + 1}`}
                          className="w-full h-80 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-900">Project ZIP File</p>
                        <a 
                          href={`${API_BASE}/${allScreenshots[currentImageIndex]}`} 
                          download
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
                    {allScreenshots.length > 1 && (
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
                  {allScreenshots.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto py-2">
                      {allScreenshots.map((screenshot, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {getFileType(screenshot) === 'screenshot' ? (
                            <img 
                              src={`${API_BASE}/${screenshot}`} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Counter */}
                  {allScreenshots.length > 1 && (
                    <div className="text-center text-sm text-gray-500">
                      {currentImageIndex + 1} of {allScreenshots.length} images
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500">No images available</p>
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
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.prompt_text}</p>
                  </div>
                </div>
                
                {/* Download Options */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Files</h3>
                  <div className="space-y-3">
                    {allScreenshots.map((screenshot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getFileType(screenshot) === 'screenshot' ? (
                            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {getFileType(screenshot) === 'screenshot' 
                              ? `Screenshot ${index + 1}` 
                              : 'Project ZIP File'}
                          </span>
                        </div>
                        <a 
                          href={`${API_BASE}/${screenshot}`} 
                          download
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