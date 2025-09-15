import React from 'react';
import styles from './EnhancedUI.module.css';

// Enhanced Card Component with 3D effects
export const Card3D = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.card3d} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Enhanced Stats Card Component
export const StatsCard3D = ({ title, value, icon, color = 'primary', className = '', ...props }) => {
  const colorClasses = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  };

  return (
    <div 
      className={`${styles.statsCard3d} p-6 text-white transform transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ background: colorClasses[color] }}
      {...props}
    >
      <div className="flex items-center">
        <div className="rounded-full bg-white bg-opacity-20 p-3">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-white text-opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Modal Component
export const Modal3D = ({ isOpen, onClose, title, children, className = '', ...props }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          className={`${styles.modal3d} inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          {...props}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg leading-6 font-medium ${styles.gradientText}`} id="modal-headline">
                  {title}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Input Component
export const Input3D = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`${styles.input3d} block w-full ${className} ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Enhanced Textarea Component
export const Textarea3D = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`${styles.textarea3d} block w-full ${className} ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Enhanced Select Component
export const Select3D = ({ label, error, className = '', children, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`${styles.select3d} block w-full ${className} ${error ? 'border-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Enhanced File Upload Component
export const FileUpload3D = ({ 
  label, 
  error, 
  onFileSelect, 
  onDragEnter,
  onDragLeave,
  onDrop,
  dragActive,
  fileName,
  fileSize,
  accept,
  className = '',
  ...props 
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (onFileSelect) onFileSelect(file);
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      if (onDragEnter) onDragEnter(e);
    } else if (e.type === "dragleave") {
      if (onDragLeave) onDragLeave(e);
    } else if (e.type === "drop") {
      if (onDrop) onDrop(e);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div 
        className={`${styles.fileUpload3d} mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-300 ${
          dragActive ? styles.dragActive : ''
        } ${error ? 'border-red-500' : ''} ${className}`}
        onDragEnter={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDragOver={handleDragEvents}
        onDrop={handleDragEvents}
        {...props}
      >
        <div className="space-y-1 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                onChange={handleFileChange}
                accept={accept}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept ? `Supported formats: ${accept}` : 'Any file type'}
          </p>
        </div>
      </div>
      {fileName && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="ml-2">
            {fileName} ({fileSize})
          </span>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Enhanced Badge Component
export const Badge3D = ({ children, variant = 'primary', className = '', ...props }) => {
  const variantClasses = {
    primary: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// Enhanced Alert Component
export const Alert3D = ({ children, variant = 'info', title, onClose, className = '', ...props }) => {
  const variantClasses = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      title: 'text-blue-800',
      text: 'text-blue-700',
      icon: (
        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    success: {
      container: 'bg-green-50 border-green-200',
      title: 'text-green-800',
      text: 'text-green-700',
      icon: (
        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      icon: (
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    danger: {
      container: 'bg-red-50 border-red-200',
      title: 'text-red-800',
      text: 'text-red-700',
      icon: (
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const variantStyle = variantClasses[variant];

  return (
    <div className={`rounded-lg border p-4 ${variantStyle.container} ${className}`} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          {variantStyle.icon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${variantStyle.title}`}>
              {title}
            </h3>
          )}
          <div className={`mt-2 text-sm ${variantStyle.text}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex bg-white rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};