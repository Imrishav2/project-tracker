import React, { useState } from 'react';
import { submitForm } from './api';
import API_BASE from './apiConfig';
import styles from './components/EnhancedUI.module.css';
import Button3D from './components/Button3D';
import { Card3D, Alert3D } from './components/EnhancedComponents';

const EnhancedFormPage = () => {
  const [formData, setFormData] = useState({
    lumen_name: '',
    prompt_text: '',
    ai_used: 'GPT-5',
    ai_agent: '',
    reward_amount: '',
  });
  
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('screenshot');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (errors.screenshot) {
      setErrors(prev => ({
        ...prev,
        screenshot: ''
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      if (errors.screenshot) {
        setErrors(prev => ({
          ...prev,
          screenshot: ''
        }));
      }
    }
  };

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setFile(null);
    document.getElementById('screenshot').value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.lumen_name.trim()) {
      newErrors.lumen_name = 'Lumen Name is required';
    }
    
    if (!formData.prompt_text.trim()) {
      newErrors.prompt_text = 'Prompt Text is required';
    }
    
    if (!formData.ai_agent.trim()) {
      newErrors.ai_agent = 'AI Agent is required';
    }
    
    if (!formData.reward_amount) {
      newErrors.reward_amount = 'Reward Amount is required';
    } else if (isNaN(formData.reward_amount) || parseFloat(formData.reward_amount) < 0.01) {
      newErrors.reward_amount = 'Reward Amount must be at least 0.01';
    }
    
    if (!file) {
      newErrors.screenshot = 'File is required';
    } else {
      if (fileType === 'screenshot') {
        const allowedTypes = ['image/jpeg', 'image/png'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Only .jpg, .jpeg, .png files are allowed for screenshots';
        }
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must have a valid extension (.jpg, .jpeg, .png)';
        }
        
        if (file.size > 10 * 1024 * 1024) {
          newErrors.screenshot = 'Screenshot size must be less than 10MB';
        }
      } else {
        const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
        const allowedExtensions = ['.zip'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Only .zip files are allowed for project uploads';
        }
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must have a .zip extension';
        }
        
        if (file.size > 50 * 1024 * 1024) {
          newErrors.screenshot = 'Project file size must be less than 50MB';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const data = new FormData();
      data.append('lumen_name', formData.lumen_name);
      data.append('prompt_text', formData.prompt_text);
      data.append('ai_used', formData.ai_used);
      data.append('ai_agent', formData.ai_agent);
      data.append('reward_amount', parseFloat(formData.reward_amount));
      data.append(fileType, file);
      
      console.log('Submitting form to:', `${API_BASE}/api/submit`); // Debug log
      
      const response = await submitForm(data);
      setSuccessMessage(response.message);
      
      setFormData({
        lumen_name: '',
        prompt_text: '',
        ai_used: 'GPT-5',
        ai_agent: '',
        reward_amount: '',
      });
      setFile(null);
      setFileType('screenshot');
      document.getElementById('screenshot').value = '';
      
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.error) {
        setErrors({ form: error.response.data.error });
      } else {
        setErrors({ form: 'An error occurred during submission. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypeIcon = (type) => {
    if (type === 'screenshot') {
      return (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className={`text-3xl md:text-4xl font-bold ${styles.gradientText}`}>Project Submission</h1>
        <p className="mt-3 text-lg text-gray-600">Share your AI-generated projects with the community</p>
      </div>

      <Card3D className="overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          {successMessage && (
            <Alert3D variant="success" title="Success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert3D>
          )}
          
          {errors.form && (
            <Alert3D variant="danger" title="Error" onClose={() => setErrors(prev => ({ ...prev, form: '' }))}>
              {errors.form}
              <p className="text-xs text-white text-opacity-80 mt-1">API Base URL: {API_BASE}</p>
            </Alert3D>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lumen Name */}
              <div className="space-y-2">
                <label htmlFor="lumen_name" className="block text-lg font-medium text-gray-800">
                  Lumen Name <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600">Enter your unique identifier or username</p>
                <input
                  type="text"
                  id="lumen_name"
                  name="lumen_name"
                  value={formData.lumen_name}
                  onChange={handleChange}
                  className={`${styles.input3d} mt-2 block w-full ${errors.lumen_name ? 'border-red-500' : ''}`}
                  placeholder="e.g., AI_Explorer_2025"
                />
                {errors.lumen_name && <p className="mt-1 text-sm text-red-600">{errors.lumen_name}</p>}
              </div>
              
              {/* Reward Amount */}
              <div className="space-y-2">
                <label htmlFor="reward_amount" className="block text-lg font-medium text-gray-800">
                  Reward Amount <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600">Enter the reward amount for this submission (minimum $0.01)</p>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    id="reward_amount"
                    name="reward_amount"
                    step="0.01"
                    min="0.01"
                    value={formData.reward_amount}
                    onChange={handleChange}
                    className={`${styles.input3d} block w-full pl-10 pr-12 ${errors.reward_amount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                {errors.reward_amount && <p className="mt-1 text-sm text-red-600">{errors.reward_amount}</p>}
              </div>
            </div>
            
            {/* File Type Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-800">
                  Upload Type <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">Choose between uploading a screenshot or a complete project folder</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleFileTypeChange('screenshot')}
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                    fileType === 'screenshot'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform -translate-y-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {getFileTypeIcon('screenshot')}
                  Screenshot
                </button>
                <button
                  type="button"
                  onClick={() => handleFileTypeChange('project')}
                  className={`flex items-center justify-center px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                    fileType === 'project'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform -translate-y-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {getFileTypeIcon('project')}
                  Project Folder (ZIP)
                </button>
              </div>
            </div>
            
            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="screenshot" className="block text-lg font-medium text-gray-800">
                {fileType === 'screenshot' ? 'Prompt Screenshot' : 'Project ZIP File'} <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600">
                {fileType === 'screenshot' 
                  ? 'Upload a screenshot of your AI-generated output (PNG, JPG, JPEG up to 10MB)' 
                  : 'Upload your complete project folder as a ZIP file (up to 50MB)'}
              </p>
              <div 
                className={`${styles.fileUpload3d} mt-3 flex justify-center px-6 pt-8 pb-10 transition-all duration-300 ${
                  dragActive 
                    ? styles.dragActive 
                    : errors.screenshot 
                      ? 'border-red-500 bg-red-50' 
                      : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                    <svg className="h-8 w-8 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600">
                    <label
                      htmlFor="screenshot"
                      className="relative cursor-pointer bg-white rounded-lg font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-4 py-2 border border-gray-300 shadow-sm"
                    >
                      <span className="font-semibold">Upload a file</span>
                      <input
                        id="screenshot"
                        name="screenshot"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept={fileType === 'screenshot' ? ".jpg,.jpeg,.png" : ".zip"}
                      />
                    </label>
                    <p className="mt-2 sm:mt-0 sm:ml-2">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fileType === 'screenshot' 
                      ? 'PNG, JPG, JPEG up to 10MB' 
                      : 'ZIP files up to 50MB'}
                  </p>
                </div>
              </div>
              {errors.screenshot && <p className="mt-2 text-sm text-red-600">{errors.screenshot}</p>}
              {file && (
                <div className="mt-3 bg-green-50 rounded-xl p-4 flex items-center shadow-sm">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm text-green-700 truncate">
                      Selected file: <span className="font-medium">{file.name}</span>
                    </p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Prompt Text */}
            <div className="space-y-2">
              <label htmlFor="prompt_text" className="block text-lg font-medium text-gray-800">
                Prompt Text <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600">Enter the exact prompt you used to generate this project</p>
              <textarea
                id="prompt_text"
                name="prompt_text"
                rows={6}
                value={formData.prompt_text}
                onChange={handleChange}
                className={`${styles.textarea3d} mt-2 block w-full ${errors.prompt_text ? 'border-red-500' : ''}`}
                placeholder="Describe the prompt you used to generate this project..."
              />
              {errors.prompt_text && <p className="mt-1 text-sm text-red-600">{errors.prompt_text}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Which AI Used */}
              <div className="space-y-2">
                <label htmlFor="ai_used" className="block text-lg font-medium text-gray-800">
                  Which AI Used for Prompt <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600">Select the AI model you used</p>
                <div className="mt-2">
                  <select
                    id="ai_used"
                    name="ai_used"
                    value={formData.ai_used}
                    onChange={handleChange}
                    className={`${styles.select3d} block w-full`}
                  >
                    <option value="GPT-5">GPT-5</option>
                    <option value="Claude">Claude</option>
                    <option value="LLaMA">LLaMA</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Which AI Agent Used */}
              <div className="space-y-2">
                <label htmlFor="ai_agent" className="block text-lg font-medium text-gray-800">
                  Which AI Agent Used for Project Generation <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600">Specify the AI agent or tool used</p>
                <input
                  type="text"
                  id="ai_agent"
                  name="ai_agent"
                  value={formData.ai_agent}
                  onChange={handleChange}
                  className={`${styles.input3d} mt-2 block w-full ${errors.ai_agent ? 'border-red-500' : ''}`}
                  placeholder="e.g., Cursor, GitHub Copilot, etc."
                />
                {errors.ai_agent && <p className="mt-1 text-sm text-red-600">{errors.ai_agent}</p>}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6">
              <Button3D
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner3d}></div>
                    <span className="ml-3">Submitting...</span>
                  </>
                ) : (
                  'Submit Project'
                )}
              </Button3D>
            </div>
          </form>
        </div>
      </Card3D>
    </div>
  );
};

export default EnhancedFormPage;