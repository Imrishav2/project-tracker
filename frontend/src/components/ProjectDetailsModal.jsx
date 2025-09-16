import React, { useState, useEffect } from 'react';
import API_BASE from '../apiConfig';

const ProjectDetailsModal = ({ submission, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  
  // Combine primary file with additional screenshots
  // Handle cases where additional_screenshots might be undefined or not an array
  const allFiles = [
    ...(submission.screenshot_path ? [{path: submission.screenshot_path, isPrimary: true}] : []),
    ...((submission.additional_screenshots && Array.isArray(submission.additional_screenshots)) 
        ? submission.additional_screenshots.map(screenshot => ({path: screenshot, isPrimary: false}))
        : (submission.additional_screenshots && typeof submission.additional_screenshots === 'string'
            ? submission.additional_screenshots.split(',').map(screenshot => ({path: screenshot.trim(), isPrimary: false}))
            : []))
  ].filter(file => file.path); // Filter out any files without paths
  
  const getFileType = (filePath) => {
    if (!filePath) return 'unknown';
    
    // Extract just the filename from the path
    const filename = filePath.split('/').pop().split('\\').pop().toLowerCase();
    
    // Check file extension
    if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      return 'screenshot';
    }
    
    if (filename.endsWith('.zip') || filename.endsWith('.rar') || filename.endsWith('.7z')) {
      return 'project';
    }
    
    // Fallback to filename content check
    if (filename.includes('screenshot')) return 'screenshot';
    if (filename.includes('project')) return 'project';
    
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
    try {
      const date = new Date(dateString);
      // Convert to Indian Standard Time (IST)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      };
      return date.toLocaleDateString('en-IN', options);
    } catch (error) {
      // Fallback to default formatting if there's an error
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  const nextImage = () => {
    // Navigate through screenshot files only
    const isCurrentFileScreenshot = getFileType(allFiles[currentImageIndex].path) === 'screenshot';
    
    if (isCurrentFileScreenshot && screenshotFiles.length > 1) {
      const currentScreenshotIndex = screenshotFiles.findIndex(file => 
        file.path === allFiles[currentImageIndex].path
      );
      
      if (currentScreenshotIndex !== -1) {
        const nextIndex = (currentScreenshotIndex + 1) % screenshotFiles.length;
        const nextFileIndex = allFiles.findIndex(file => 
          file.path === screenshotFiles[nextIndex].path
        );
        if (nextFileIndex !== -1) {
          setCurrentImageIndex(nextFileIndex);
        }
      }
    } else if (allFiles.length > 1) {
      // If current file is not a screenshot or no screenshots, move to next file
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allFiles.length);
    }
  };
  
  const prevImage = () => {
    // Navigate through screenshot files only
    const isCurrentFileScreenshot = getFileType(allFiles[currentImageIndex].path) === 'screenshot';
    
    if (isCurrentFileScreenshot && screenshotFiles.length > 1) {
      const currentScreenshotIndex = screenshotFiles.findIndex(file => 
        file.path === allFiles[currentImageIndex].path
      );
      
      if (currentScreenshotIndex !== -1) {
        const prevIndex = (currentScreenshotIndex - 1 + screenshotFiles.length) % screenshotFiles.length;
        const prevFileIndex = allFiles.findIndex(file => 
          file.path === screenshotFiles[prevIndex].path
        );
        if (prevFileIndex !== -1) {
          setCurrentImageIndex(prevFileIndex);
        }
      }
    } else if (allFiles.length > 1) {
      // If current file is not a screenshot or no screenshots, move to previous file
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
  
  // Separate screenshots from other files
  const screenshotFiles = allFiles.filter(file => getFileType(file.path) === 'screenshot');
  const otherFiles = allFiles.filter(file => getFileType(file.path) !== 'screenshot');
  
  // Auto-advance through screenshot files only every 3 seconds
  useEffect(() => {
    if (!autoAdvance || screenshotFiles.length <= 1) return;
    
    // Don't auto-advance if current file is not a screenshot
    const isCurrentFileScreenshot = getFileType(allFiles[currentImageIndex].path) === 'screenshot';
    if (!isCurrentFileScreenshot) {
      // If we're on a non-screenshot file, find the first screenshot to start auto-advance
      const firstScreenshotIndex = allFiles.findIndex(file => getFileType(file.path) === 'screenshot');
      if (firstScreenshotIndex !== -1 && firstScreenshotIndex !== currentImageIndex) {
        setCurrentImageIndex(firstScreenshotIndex);
      }
      return;
    }
    
    const interval = setInterval(() => {
      // Only advance through screenshots
      const currentScreenshotIndex = screenshotFiles.findIndex(file => 
        file.path === allFiles[currentImageIndex].path
      );
      
      if (currentScreenshotIndex !== -1) {
        const nextIndex = (currentScreenshotIndex + 1) % screenshotFiles.length;
        const nextFileIndex = allFiles.findIndex(file => 
          file.path === screenshotFiles[nextIndex].path
        );
        if (nextFileIndex !== -1) {
          setCurrentImageIndex(nextFileIndex);
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [allFiles, currentImageIndex, autoAdvance, screenshotFiles]);
  
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
                      <div className="bg-gray-100 rounded-lg overflow-auto max-h-[70vh] flex items-center justify-center relative">
                        <img 
                          src={`${API_BASE}/uploads/${allFiles[currentImageIndex].path.split('/').pop().split('\\').pop()}`} 
                          alt={`Screenshot ${currentImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('Image load error for:', e.target.src);
                            // Show error message with file name and retry option
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-96 flex flex-col items-center justify-center text-gray-500 p-4 text-center bg-gray-50 rounded-lg">
                                <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="mt-4 font-medium">Image not available</p>
                                <p class="text-sm mt-2 text-gray-600">${allFiles[currentImageIndex].path.split('/').pop().split('\\').pop()}</p>
                                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" onclick="window.location.reload()">Retry Loading</button>
                              </div>
                            `;
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', e.target.src);
                          }}
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
                          href={`${API_BASE}/uploads/${allFiles[currentImageIndex].path.split('/').pop().split('\\').pop()}`} 
                          download={getFileType(allFiles[currentImageIndex].path) === 'project' ? 'project.zip' : 'screenshot.jpg'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Project
                        </a>
                      </div>
                    )}
                    
                    {/* Navigation Arrows (if multiple screenshots) */}
                    {screenshotFiles.length > 1 && (
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
                              src={`${API_BASE}/uploads/${file.path.split('/').pop().split('\\').pop()}`} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Thumbnail load error for:', e.target.src);
                                // Show error message with file name
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center text-gray-500 p-1 text-center bg-gray-50">
                                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs text-gray-500 mt-1">Image N/A</span>
                                  </div>
                                `;
                              }}
                              onLoad={(e) => {
                                console.log('Thumbnail loaded successfully:', e.target.src);
                              }}
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
                      {currentImageIndex + 1} of {allFiles.length} files ({screenshotFiles.length} screenshots, {otherFiles.length} other files)
                      <div className="flex items-center justify-center mt-2 space-x-4">
                        <button
                          onClick={() => setAutoAdvance(!autoAdvance)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            autoAdvance 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {autoAdvance ? 'Stop Auto' : 'Start Auto'}
                        </button>
                        {screenshotFiles.length > 1 && (
                          <div className="text-xs text-gray-400">
                            Auto-advances through screenshots only
                          </div>
                        )}
                      </div>
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
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
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
                              ? (file.isPrimary ? `Primary Screenshot` : `Additional Screenshot`)
                              : (file.isPrimary ? `Primary Project ZIP File` : `Additional Project ZIP File`)}
                            <br />
                            <span className="text-sm text-gray-500">{file.path.split('/').pop().split('\\').pop()}</span>
                          </span>
                        </div>
                        <a 
                          href={`${API_BASE}/uploads/${file.path.split('/').pop().split('\\').pop()}`} 
                          download={getFileType(file.path) === 'project' ? `project-${index + 1}.zip` : `screenshot-${index + 1}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
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