import { useState, useEffect } from 'react';
import { checkConnection } from '../utils/connectionTest';

export default function APITestPage() {
  const [testResult, setTestResult] = useState({ status: 'pending', data: null, error: null });
  
  useEffect(() => {
    async function runTest() {
      try {
        setTestResult({ status: 'testing', data: null, error: null });
        const result = await checkConnection();
        setTestResult({ 
          status: result.success ? 'success' : 'error', 
          data: result, 
          error: result.error 
        });
      } catch (error) {
        setTestResult({ status: 'error', data: null, error: error.message });
      }
    }
    
    runTest();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <div className={`p-4 rounded-md ${
            testResult.status === 'pending' ? 'bg-gray-200' :
            testResult.status === 'testing' ? 'bg-yellow-100' :
            testResult.status === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {testResult.status === 'pending' && <p>Waiting to run test...</p>}
            {testResult.status === 'testing' && <p>Running connection test...</p>}
            {testResult.status === 'success' && (
              <p className="text-green-600 font-medium">✅ Connection successful! Frontend and backend are properly connected.</p>
            )}
            {testResult.status === 'error' && (
              <p className="text-red-600 font-medium">❌ Connection failed: {testResult.error}</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Environment Information</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "https://quiztime-backend-efv0.onrender.com"}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Test Again
          </button>
        </div>
      </div>
    </div>
  );
}