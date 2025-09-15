import React, { useState, useEffect } from 'react';
import API_BASE from './apiConfig';

const ApiTestComponent = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
          const data = await response.json();
          setStatus('✅ API Connection Successful');
          setDetails(`Backend is running. Timestamp: ${data.timestamp}`);
        } else {
          setStatus('❌ API Connection Failed');
          setDetails(`HTTP Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setStatus('❌ API Connection Failed');
        setDetails(`Error: ${error.message}`);
      }
    };

    testApiConnection();
  }, []);

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>API Connection Test:</strong> {status}
          </p>
          {details && (
            <p className="text-xs text-yellow-600 mt-1">{details}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;