import React, { useState } from 'react';
import { submitForm } from './api';
import API_BASE from './apiConfig';

const FormPage = () => {
  return <SimpleFormPage />;
};

// Simple, user-friendly form component
const SimpleFormPage = () => {
  const [formData, setFormData] = useState({
    lumen_name: '',
    prompt_text: '',
    ai_used: 'GPT-5',
    ai_agent: '',
    reward_amount: '',
  });
  
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('screenshot');
  const [additionalScreenshots, setAdditionalScreenshots] = useState([]);
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

  // New function to handle additional screenshots
  const handleAdditionalScreenshotsChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalScreenshots(files);
    
    // Clear error when user selects files
    if (errors.additional_screenshots) {
      setErrors(prev => ({
        ...prev,
        additional_screenshots: ''
      }));
    }
  };

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setFile(null);
    setAdditionalScreenshots([]);
    document.getElementById('file-input').value = '';
    if (document.getElementById('additional-screenshots-input')) {
      document.getElementById('additional-screenshots-input').value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.lumen_name.trim()) {
      newErrors.lumen_name = 'Please enter your name or identifier';
    }
    
    if (!formData.prompt_text.trim()) {
      newErrors.prompt_text = 'Please enter the prompt you used';
    }
    
    if (!formData.ai_agent.trim()) {
      newErrors.ai_agent = 'Please specify which AI tool you used';
    }
    
    if (!formData.reward_amount) {
      newErrors.reward_amount = 'Please enter a reward amount';
    } else if (isNaN(formData.reward_amount) || parseFloat(formData.reward_amount) < 0.01) {
      newErrors.reward_amount = 'Reward must be at least $0.01';
    }
    
    if (!file) {
      newErrors.screenshot = 'Please select a file to upload';
    } else {
      if (fileType === 'screenshot') {
        const allowedTypes = ['image/jpeg', 'image/png'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Please select a JPG or PNG image';
        }
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must be a JPG or PNG image';
        }
        
        if (file.size > 10 * 1024 * 1024) {
          newErrors.screenshot = 'Image size must be less than 10MB';
        }
        
        // Validate additional screenshots
        for (let i = 0; i < additionalScreenshots.length; i++) {
          const additionalFile = additionalScreenshots[i];
          if (!allowedTypes.includes(additionalFile.type)) {
            newErrors.additional_screenshots = 'All additional files must be JPG or PNG images';
            break;
          }
          
          const fileExt = '.' + additionalFile.name.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(fileExt)) {
            newErrors.additional_screenshots = 'All additional files must be JPG or PNG images';
            break;
          }
          
          if (additionalFile.size > 10 * 1024 * 1024) {
            newErrors.additional_screenshots = 'Additional images must be less than 10MB each';
            break;
          }
        }
      } else {
        const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
        const allowedExtensions = ['.zip'];
        
        if (!allowedTypes.includes(file.type)) {
          newErrors.screenshot = 'Please select a ZIP file';
        }
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          newErrors.screenshot = 'File must be a ZIP archive';
        }
        
        if (file.size > 50 * 1024 * 1024) {
          newErrors.screenshot = 'ZIP file size must be less than 50MB';
        }
        
        // No additional screenshots for project files
        if (additionalScreenshots.length > 0) {
          newErrors.additional_screenshots = 'Additional screenshots are only allowed for screenshot uploads';
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
      
      // Append additional screenshots if any
      additionalScreenshots.forEach((screenshot, index) => {
        data.append('additional_screenshots', screenshot);
      });
      
      const response = await submitForm(data);
      setSuccessMessage(response.message);
      
      // Reset form
      setFormData({
        lumen_name: '',
        prompt_text: '',
        ai_used: 'GPT-5',
        ai_agent: '',
        reward_amount: '',
      });
      setFile(null);
      setFileType('screenshot');
      setAdditionalScreenshots([]);
      document.getElementById('file-input').value = '';
      if (document.getElementById('additional-screenshots-input')) {
        document.getElementById('additional-screenshots-input').value = '';
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.error) {
        setErrors({ form: error.response.data.error });
      } else {
        setErrors({ form: 'Unable to submit your project. Please check your connection and try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Your AI Project</h1>
        <p className="text-gray-600">Share your AI-generated creations with the community</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}
        
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{errors.form}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lumen Name */}
            <div>
              <label htmlFor="lumen_name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lumen_name"
                name="lumen_name"
                value={formData.lumen_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lumen_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., AI_Explorer"
              />
              {errors.lumen_name && <p className="mt-1 text-sm text-red-600">{errors.lumen_name}</p>}
            </div>
            
            {/* Reward Amount */}
            <div>
              <label htmlFor="reward_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Reward Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
                  className={`block w-full pl-8 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reward_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.reward_amount && <p className="mt-1 text-sm text-red-600">{errors.reward_amount}</p>}
            </div>
          </div>
          
          {/* File Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFileTypeChange('screenshot')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
                  fileType === 'screenshot'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Screenshot
              </button>
              <button
                type="button"
                onClick={() => handleFileTypeChange('project')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border ${
                  fileType === 'project'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Project ZIP
              </button>
            </div>
          </div>
          
          {/* File Upload */}
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
              {fileType === 'screenshot' ? 'Prompt Screenshot' : 'Project ZIP File'} <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-gray-300">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-input"
                      name="file-input"
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
                    ? 'PNG, JPG up to 10MB' 
                    : 'ZIP files up to 50MB'}
                </p>
              </div>
            </div>
            {errors.screenshot && <p className="mt-2 text-sm text-red-600">{errors.screenshot}</p>}
            {file && (
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <svg className="flex-shrink-0 h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 truncate">{file.name}</span>
              </div>
            )}
            
            {/* Additional Screenshots Upload (only for screenshot type) */}
            {fileType === 'screenshot' && (
              <div className="mt-4">
                <label htmlFor="additional-screenshots-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Screenshots (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-gray-300">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="additional-screenshots-input"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload additional screenshots</span>
                        <input
                          id="additional-screenshots-input"
                          name="additional-screenshots-input"
                          type="file"
                          className="sr-only"
                          onChange={handleAdditionalScreenshotsChange}
                          accept=".jpg,.jpeg,.png"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG files up to 10MB each
                    </p>
                  </div>
                </div>
                {errors.additional_screenshots && <p className="mt-2 text-sm text-red-600">{errors.additional_screenshots}</p>}
                
                {/* Display selected additional screenshots */}
                {additionalScreenshots.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected additional screenshots:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {additionalScreenshots.map((screenshot, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 rounded p-2">
                          <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{screenshot.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* File Preview Section */}
            {file && fileType === 'screenshot' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>
            )}
            
            {file && fileType === 'project' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Project File:</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center">
                  <svg className="h-8 w-8 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Prompt Text */}
          <div>
            <label htmlFor="prompt_text" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="prompt_text"
              name="prompt_text"
              rows={4}
              value={formData.prompt_text}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.prompt_text ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter the exact prompt you used to generate this project..."
            />
            {errors.prompt_text && <p className="mt-1 text-sm text-red-600">{errors.prompt_text}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Which AI Used */}
            <div>
              <label htmlFor="ai_used" className="block text-sm font-medium text-gray-700 mb-1">
                AI Model <span className="text-red-500">*</span>
              </label>
              <select
                id="ai_used"
                name="ai_used"
                value={formData.ai_used}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="GPT-5">GPT-5</option>
                <option value="Claude">Claude</option>
                <option value="LLaMA">LLaMA</option>
                <option value="Gemini">Gemini</option>
                <option value="Perplexity">Perplexity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Which AI Agent Used */}
            <div>
              <label htmlFor="ai_agent" className="block text-sm font-medium text-gray-700 mb-1">
                AI Tool <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ai_agent"
                name="ai_agent"
                value={formData.ai_agent}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.ai_agent ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Cursor, GitHub Copilot"
              />
              {errors.ai_agent && <p className="mt-1 text-sm text-red-600">{errors.ai_agent}</p>}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPage;