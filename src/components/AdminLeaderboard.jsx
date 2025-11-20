import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to fetch from API
      const response = await fetch('/api/admin/leaderboard');
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } else {
        throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      
      // Fallback to mock data
      setLeaderboard([
        {
          id: '1',
          username: 'quiz_master',
          score: 1250000,
          correctAnswers: 18,
          wrongAnswers: 2,
          timeSpent: 350,
          date: '2023-05-10T15:23:48Z',
          difficulty: 'hard'
        },
        {
          id: '2',
          username: 'trivia_fan',
          score: 980000,
          correctAnswers: 15,
          wrongAnswers: 5,
          timeSpent: 420,
          date: '2023-05-12T09:12:33Z',
          difficulty: 'medium'
        },
        {
          id: '3',
          username: 'gaming_guru',
          score: 850000,
          correctAnswers: 14,
          wrongAnswers: 6,
          timeSpent: 380,
          date: '2023-05-08T18:45:22Z',
          difficulty: 'medium'
        },
        {
          id: '4',
          username: 'knowledge_king',
          score: 1200000,
          correctAnswers: 17,
          wrongAnswers: 3,
          timeSpent: 400,
          date: '2023-04-29T14:33:19Z',
          difficulty: 'hard'
        },
        {
          id: '5',
          username: 'quiz_newbie',
          score: 450000,
          correctAnswers: 9,
          wrongAnswers: 11,
          timeSpent: 500,
          date: '2023-05-15T11:22:07Z',
          difficulty: 'easy'
        },
        {
          id: '6',
          username: 'brain_challenger',
          score: 720000,
          correctAnswers: 12,
          wrongAnswers: 8,
          timeSpent: 430,
          date: '2023-05-05T16:17:32Z',
          difficulty: 'medium'
        },
        {
          id: '7',
          username: 'quiz_master',
          score: 950000,
          correctAnswers: 15,
          wrongAnswers: 5,
          timeSpent: 410,
          date: '2023-05-14T13:24:56Z',
          difficulty: 'medium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setShowEntryDetails(true);
  };
  
  const closeEntryDetails = () => {
    setShowEntryDetails(false);
  };
  
  // Apply time filter
  const filteredLeaderboard = leaderboard.filter(entry => {
    if (timeFilter === 'all') return true;
    
    const entryDate = new Date(entry.date);
    const now = new Date();
    
    switch(timeFilter) {
      case 'today':
        return entryDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return entryDate >= monthAgo;
      default:
        return true;
    }
  }).sort((a, b) => b.score - a.score); // Sort by score descending
  
  const getDifficultyBadgeClass = (difficulty) => {
    switch(difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatTimeSpent = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader />
        <p className="mt-4 text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }
  
  if (error && leaderboard.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
        <h3 className="text-lg font-medium">Error loading leaderboard</h3>
        <p className="mt-2">{error}</p>
        <button 
          onClick={fetchLeaderboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Leaderboard Management</h2>
        <button 
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p className="font-medium">Warning: Showing mock data</p>
          <p className="text-sm mt-1">API Error: {error}</p>
        </div>
      )}
      
      {/* Filter */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-4 py-2 rounded ${timeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`px-4 py-2 rounded ${timeFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFilter('week')}
          className={`px-4 py-2 rounded ${timeFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFilter('today')}
          className={`px-4 py-2 rounded ${timeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Today
        </button>
      </div>
      
      {/* Leaderboard Table */}
      {filteredLeaderboard.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaderboard.map((entry, index) => (
                <motion.tr 
                  key={entry.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">#{index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{entry.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${entry.score.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeClass(entry.difficulty)}`}>
                      {entry.difficulty?.charAt(0).toUpperCase() + entry.difficulty?.slice(1) || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            entry.correctAnswers / (entry.correctAnswers + entry.wrongAnswers) * 100 > 70 ? 'bg-green-600' : 
                            entry.correctAnswers / (entry.correctAnswers + entry.wrongAnswers) * 100 > 40 ? 'bg-yellow-400' : 'bg-red-600'
                          }`}
                          style={{ width: `${entry.correctAnswers / (entry.correctAnswers + entry.wrongAnswers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {Math.round(entry.correctAnswers / (entry.correctAnswers + entry.wrongAnswers) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(entry)} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => alert(`Would delete entry: ${entry.id}`)}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">No leaderboard entries found for the selected time period</p>
        </div>
      )}
      
      {/* Entry Details Modal */}
      {showEntryDetails && selectedEntry && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900 mr-3">
                  Game Details
                </h3>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeClass(selectedEntry.difficulty)}`}>
                  {selectedEntry.difficulty?.charAt(0).toUpperCase() + selectedEntry.difficulty?.slice(1) || 'Unknown'}
                </span>
              </div>
              <button 
                onClick={closeEntryDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{selectedEntry.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{new Date(selectedEntry.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="font-medium text-2xl text-green-600">${selectedEntry.score.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Spent</p>
                  <p className="font-medium">{formatTimeSpent(selectedEntry.timeSpent)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Performance</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Correct Answers</p>
                      <p className="font-medium text-green-600">{selectedEntry.correctAnswers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wrong Answers</p>
                      <p className="font-medium text-red-600">{selectedEntry.wrongAnswers}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">Accuracy</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                    <div 
                      className={`h-4 rounded-full ${
                        selectedEntry.correctAnswers / (selectedEntry.correctAnswers + selectedEntry.wrongAnswers) * 100 > 70 ? 'bg-green-600' : 
                        selectedEntry.correctAnswers / (selectedEntry.correctAnswers + selectedEntry.wrongAnswers) * 100 > 40 ? 'bg-yellow-400' : 'bg-red-600'
                      }`}
                      style={{ width: `${selectedEntry.correctAnswers / (selectedEntry.correctAnswers + selectedEntry.wrongAnswers) * 100}%` }}
                    >
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.round(selectedEntry.correctAnswers / (selectedEntry.correctAnswers + selectedEntry.wrongAnswers) * 100)}% accuracy
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button
                  onClick={closeEntryDetails}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminLeaderboard;