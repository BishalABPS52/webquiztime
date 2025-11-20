import { useState, useEffect } from 'react';
import { checkConnection } from '../utils/connectionTest';

export default function APITestPage() {
  const [testResult, setTestResult] = useState({ status: 'pending', data: null, error: null });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('testUser');
  const [difficulty, setDifficulty] = useState('easy');
  
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

  // Function to test getting questions
  const testGetQuestions = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          level: difficulty,
          count: 5
        }),
      });
      
      const data = await response.json();
      setResults({
        endpoint: 'questions',
        data
      });
    } catch (err) {
      setError(`Error testing questions API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test getting leaderboard
  const testGetLeaderboard = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setResults({
        endpoint: 'leaderboard',
        data
      });
    } catch (err) {
      setError(`Error testing leaderboard API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test getting user stats
  const testGetUserStats = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch(`/api/stats/${username}`);
      const data = await response.json();
      setResults({
        endpoint: 'stats',
        data
      });
    } catch (err) {
      setError(`Error testing user stats API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test saving user stats
  const testSaveUserStats = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          score: Math.floor(Math.random() * 1000),
          questionsAnswered: 10,
          correctAnswers: 7,
          wrongAnswers: 3,
          averageTimePerQuestion: 15.5,
          totalTime: 155,
          level: difficulty,
          lifelinesUsed: {
            '50-50': 1,
            'hint': 2
          }
        }),
      });
      
      const data = await response.json();
      setResults({
        endpoint: 'save stats',
        data
      });
    } catch (err) {
      setError(`Error testing save stats API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test lifelines
  const testLifelines = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/lifelines');
      const data = await response.json();
      setResults({
        endpoint: 'lifelines',
        data
      });
    } catch (err) {
      setError(`Error testing lifelines API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test reset questions
  const testResetQuestions = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/reset-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username
        }),
      });
      
      const data = await response.json();
      setResults({
        endpoint: 'reset questions',
        data
      });
    } catch (err) {
      setError(`Error testing reset questions API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">QuizTime API Test</h1>
      
      <div className="bg-white/10 rounded-lg p-6 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl mb-4">Connection Status</h2>
        <div className={`p-4 rounded-md ${
          testResult.status === 'pending' ? 'bg-gray-700/50' :
          testResult.status === 'testing' ? 'bg-yellow-700/50' :
          testResult.status === 'success' ? 'bg-green-700/50' : 'bg-red-700/50'
        }`}>
          {testResult.status === 'pending' && <p>Waiting to run test...</p>}
          {testResult.status === 'testing' && <p>Running connection test...</p>}
          {testResult.status === 'success' && (
            <p className="text-green-300 font-medium">✅ Connection successful! Frontend and backend are properly connected.</p>
          )}
          {testResult.status === 'error' && (
            <p className="text-red-300 font-medium">❌ Connection failed: {testResult.error}</p>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Environment Information</h3>
          <div className="bg-black/30 p-4 rounded-md">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "https://quiztime-backend-efv0.onrender.com"}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl mb-4">API Test Console</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={testGetQuestions}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
          >
            Test Get Questions
          </button>
          
          <button 
            onClick={testGetLeaderboard}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded"
          >
            Test Get Leaderboard
          </button>
          
          <button 
            onClick={testGetUserStats}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded"
          >
            Test Get User Stats
          </button>
          
          <button 
            onClick={testSaveUserStats}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded"
          >
            Test Save User Stats
          </button>
          
          <button 
            onClick={testLifelines}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded"
          >
            Test Lifelines
          </button>
          
          <button 
            onClick={testResetQuestions}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded"
          >
            Test Reset Questions
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-8 bg-red-900/50 border border-red-500 p-4 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <div className="mt-8 bg-green-900/50 border border-green-500 p-4 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Results from {results.endpoint} endpoint</h3>
          <pre className="bg-black/50 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}