import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to fetch from API
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      
      // Fallback to local storage for demo/development
      try {
        const stats = JSON.parse(localStorage.getItem('quiztime-stats') || '{}');
        const localUsers = Object.keys(stats).map(username => ({
          username,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          stats: stats[username] || {}
        }));
        setUsers(localUsers);
      } catch (localError) {
        console.error('Error with local fallback:', localError);
        // Generate mock data as last resort
        setUsers([
          { 
            username: 'demo_user1', 
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-05-15T12:30:45Z',
            stats: { 
              gamesPlayed: 12, 
              highestScore: 500000, 
              correctAnswers: 45, 
              wrongAnswers: 15 
            }
          },
          { 
            username: 'quiz_master', 
            createdAt: '2023-02-15T00:00:00Z',
            lastLogin: '2023-05-18T09:15:22Z',
            stats: { 
              gamesPlayed: 35, 
              highestScore: 1200000, 
              correctAnswers: 120, 
              wrongAnswers: 30 
            }
          },
          { 
            username: 'trivia_fan', 
            createdAt: '2023-03-10T00:00:00Z',
            lastLogin: '2023-05-17T18:45:10Z',
            stats: { 
              gamesPlayed: 8, 
              highestScore: 300000, 
              correctAnswers: 25, 
              wrongAnswers: 15 
            }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };
  
  const closeUserDetails = () => {
    setShowUserDetails(false);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader />
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }
  
  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
        <h3 className="text-lg font-medium">Error loading users</h3>
        <p className="mt-2">{error}</p>
        <button 
          onClick={fetchUsers}
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
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <div>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Refresh
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => alert('This functionality would be implemented in a full version')}
          >
            Add User
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p className="font-medium">Warning: Showing fallback data</p>
          <p className="text-sm mt-1">API Error: {error}</p>
        </div>
      )}
      
      {/* Users Table */}
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Games Played
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Highest Score
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <motion.tr 
                  key={user.username || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.stats?.gamesPlayed || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${(user.stats?.highestScore || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => alert(`Would delete user: ${user.username}`)}
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
          <p className="text-gray-500">No users found</p>
        </div>
      )}
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
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
              <h3 className="text-lg font-medium text-gray-900">
                User Details: {selectedUser.username}
              </h3>
              <button 
                onClick={closeUserDetails}
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
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Games Played</p>
                  <p className="font-medium">{selectedUser.stats?.gamesPlayed || 0}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Game Statistics</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Highest Score</p>
                      <p className="font-medium">${(selectedUser.stats?.highestScore || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Correct Answers</p>
                      <p className="font-medium">{selectedUser.stats?.correctAnswers || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wrong Answers</p>
                      <p className="font-medium">{selectedUser.stats?.wrongAnswers || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="font-medium">
                        {selectedUser.stats?.correctAnswers && selectedUser.stats?.wrongAnswers ? 
                          `${Math.round((selectedUser.stats.correctAnswers / (selectedUser.stats.correctAnswers + selectedUser.stats.wrongAnswers)) * 100)}%` : 
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button
                  onClick={closeUserDetails}
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

export default AdminUsers;