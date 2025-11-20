import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

const AdminLogin = ({ onLogin, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    onLogin(username, password);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">QuizTime Admin</h1>
          <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center py-6">
            <Loader />
            <p className="text-gray-600 mt-4">Verifying credentials...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Log In
            </button>
            
            <div className="text-center mt-4 text-sm text-gray-500">
              <p>Default credentials: admin / quiztime</p>
              <p className="text-xs mt-1">For demo purposes only</p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;