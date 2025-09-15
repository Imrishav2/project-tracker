import React, { useState } from 'react';
import { submitForm } from './api';

const FormPage = () => {
  const [formData, setFormData] = useState({
    lumen_name: '',
    prompt_text: '',
    ai_used: 'GPT-5',
    ai_agent: '', // New field for AI agent
    reward_amount: '',
  });
  
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('screenshot'); // 'screenshot' or 'project'
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
    
    // Clear file error when user selects a file
    if (errors.screenshot) {
      setErrors(prev => ({
        ...prev,
        screenshot: ''
      }));
    }
  };

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setFile(null);
    // Clear the file input
    document.getElementById('screenshot').value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
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
        // Validate screenshot file type
        const allowedTypes = ['image/jpeg', 'image/png'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Only .jpg, .jpeg, .png files are allowed for screenshots';
        }
        
        // Validate file extension
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must have a valid extension (.jpg, .jpeg, .png)';
        }
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          newErrors.screenshot = 'Screenshot size must be less than 10MB';
        }
      } else {
        // Validate project file type (zip)
        const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
        const allowedExtensions = ['.zip'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Only .zip files are allowed for project uploads';
        }
        
        // Validate file extension
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must have a .zip extension';
        }
        
        // Validate file size (50MB max for projects)
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
      // Create FormData object for file upload
      const data = new FormData();
      data.append('lumen_name', formData.lumen_name);
      data.append('prompt_text', formData.prompt_text);
      data.append('ai_used', formData.ai_used);
      data.append('ai_agent', formData.ai_agent); // Add AI agent to form data
      data.append('reward_amount', formData.reward_amount);
      data.append(fileType, file); // Use the selected file type as the field name
      
      const response = await submitForm(data);
      setSuccessMessage(response.message);
      
      // Reset form
      setFormData({
        lumen_name: '',
        prompt_text: '',
        ai_used: 'GPT-5',
        ai_agent: '', // Reset AI agent field
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Submission Form</h2>
          
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          
          {errors.form && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{errors.form}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lumen Name */}
            <div>
              <label htmlFor="lumen_name" className="block text-sm font-medium text-gray-700">
                Lumen Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lumen_name"
                name="lumen_name"
                value={formData.lumen_name}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.lumen_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.lumen_name && <p className="mt-1 text-sm text-red-600">{errors.lumen_name}</p>}
            </div>
            
            {/* File Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Type <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleFileTypeChange('screenshot')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    fileType === 'screenshot'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Screenshot
                </button>
                <button
                  type="button"
                  onClick={() => handleFileTypeChange('project')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    fileType === 'project'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Project Folder (ZIP)
                </button>
              </div>
            </div>
            
            {/* File Upload */}
            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">
                {fileType === 'screenshot' ? 'Prompt Screenshot' : 'Project ZIP File'} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="screenshot"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="screenshot"
                        name="screenshot"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept={fileType === 'screenshot' ? ".jpg,.jpeg,.png" : ".zip"}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fileType === 'screenshot' 
                      ? 'PNG, JPG, JPEG up to 10MB' 
                      : 'ZIP files up to 50MB'}
                  </p>
                </div>
              </div>
              {errors.screenshot && <p className="mt-1 text-sm text-red-600">{errors.screenshot}</p>}
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {/* Prompt Text */}
            <div>
              <label htmlFor="prompt_text" className="block text-sm font-medium text-gray-700">
                Prompt Text <span className="text-red-500">*</span>
              </label>
              <textarea
                id="prompt_text"
                name="prompt_text"
                rows={4}
                value={formData.prompt_text}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.prompt_text ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.prompt_text && <p className="mt-1 text-sm text-red-600">{errors.prompt_text}</p>}
            </div>
            
            {/* Which AI Used */}
            <div>
              <label htmlFor="ai_used" className="block text-sm font-medium text-gray-700">
                Which AI Used for Prompt <span className="text-red-500">*</span>
              </label>
              <select
                id="ai_used"
                name="ai_used"
                value={formData.ai_used}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="GPT-5">GPT-5</option>
                <option value="Claude">Claude</option>
                <option value="LLaMA">LLaMA</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Which AI Agent Used */}
            <div>
              <label htmlFor="ai_agent" className="block text-sm font-medium text-gray-700">
                Which AI Agent Used for Project Generation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ai_agent"
                name="ai_agent"
                value={formData.ai_agent}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.ai_agent ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter the AI agent used for project generation"
              />
              {errors.ai_agent && <p className="mt-1 text-sm text-red-600">{errors.ai_agent}</p>}
            </div>
            
            {/* Reward Amount */}
            <div>
              <label htmlFor="reward_amount" className="block text-sm font-medium text-gray-700">
                Reward Amount <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="reward_amount"
                  name="reward_amount"
                  step="0.01"
                  min="0.01"
                  value={formData.reward_amount}
                  onChange={handleChange}
                  className={`block w-full pl-7 border ${errors.reward_amount ? 'border-red-300' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
              </div>
              {errors.reward_amount && <p className="mt-1 text-sm text-red-600">{errors.reward_amount}</p>}
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPage;