import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLogin from '../src/components/AdminLogin';
import AdminUsers from '../src/components/AdminUsers';
import AdminQuestions from '../src/components/AdminQuestions';
import AdminLeaderboard from '../src/components/AdminLeaderboard';
import AdminStatus from '../src/components/AdminStatus';
import Loader from '../src/components/Loader';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  
  // Mock login for demo purposes
  const handleLogin = (username, password) => {
    setLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Simple credential check - in production use a secure auth system
      if (username === 'admin' && password === 'quiztime') {
        setIsLoggedIn(true);
      }
      setLoading(false);
    }, 1000);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  // Tab content mapping
  const tabComponents = {
    users: <AdminUsers />,
    questions: <AdminQuestions />,
    leaderboard: <AdminLeaderboard />,
    status: <AdminStatus />
  };
  
  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} loading={loading} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">QuizTime Admin</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 mr-2 font-medium text-sm ${activeTab === 'users' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 mr-2 font-medium text-sm ${activeTab === 'questions' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Questions
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 mr-2 font-medium text-sm ${activeTab === 'leaderboard' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Leaderboard
            </button>
            <button 
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 mr-2 font-medium text-sm ${activeTab === 'status' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              System Status
            </button>
          </nav>
        </div>
        
        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-md rounded-lg p-6"
        >
          {tabComponents[activeTab]}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;