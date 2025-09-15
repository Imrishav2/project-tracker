import React, { useState } from 'react';
import API_BASE from './apiConfig';

const TestForm = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testFormSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Create a simple test file
      const file = new File(["test content"], "test.txt", { type: "text/plain" });
      
      const data = new FormData();
      data.append('lumen_name', 'Test User');
      data.append('prompt_text', 'Test prompt');
      data.append('ai_used', 'GPT-5');
      data.append('ai_agent', 'Test Agent');
      data.append('reward_amount', '1.00');
      data.append('screenshot', file);
      
      console.log('API Base URL:', API_BASE);
      const response = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setResult(responseData);
    } catch (err) {
      console.error('Form Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Form Submission Test</h2>
      <button 
        onClick={testFormSubmission}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Test Form Submission'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <strong>Success:</strong> 
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestForm;