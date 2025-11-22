import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useApp } from '../src/context/app-context';
import QuizTimeAPI from '../src/services/api';
import withAuth from '../src/utils/withAuth';
import Layout from '../src/components/layout';

// Back Arrow Icon
const BackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);



const Leaderboards = () => {
  const router = useRouter();
  const { playSound } = useApp();
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const profile = await QuizTimeAPI.getUserProfile();
        setCurrentUser(profile);
        
        // Fetch real leaderboard data from backend
        console.log('Fetching leaderboard data...');
        const leaderboardResponse = await QuizTimeAPI.getLeaderboard();
        console.log('Leaderboard response:', leaderboardResponse);
        
        if (leaderboardResponse?.leaderboard && leaderboardResponse.leaderboard.length > 0) {
          // Transform backend leaderboard data to match UI format (already ranked by API)
          const transformedLeaderboard = leaderboardResponse.leaderboard.map(entry => ({
            username: entry.playerName || entry.username || 'Unknown Player',
            prizeMoney: entry.prizeWon || entry.totalPrizeMoney || entry.totalEarnings || entry.score || 0,
            questionsAnswered: entry.questionsAnswered || entry.correctAnswers || 0,
            completionTime: entry.completionTime || entry.totalTime || entry.averageTimePerQuestion || 0
          }));
          
          console.log('Transformed leaderboard (pre-ranked):', transformedLeaderboard);
          setLeaderboardEntries(transformedLeaderboard);
        } else if (leaderboardResponse?.entries && leaderboardResponse.entries.length > 0) {
          // Handle alternative response format (already ranked by API)
          const transformedLeaderboard = leaderboardResponse.entries.map(entry => ({
            username: entry.playerName || entry.username || 'Unknown Player',
            prizeMoney: entry.prizeWon || entry.totalPrizeMoney || entry.totalEarnings || entry.score || 0,
            questionsAnswered: entry.questionsAnswered || entry.correctAnswers || 0,
            completionTime: entry.completionTime || entry.totalTime || entry.averageTimePerQuestion || 0
          }));
          
          console.log('Transformed leaderboard (alt format, pre-ranked):', transformedLeaderboard);
          setLeaderboardEntries(transformedLeaderboard);
        } else {
          console.log('No leaderboard data available');
          // No leaderboard data available - show empty state
          setLeaderboardEntries([]);
        }
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        // Fallback data - show empty leaderboard
        setCurrentUser({ username: 'Player' });
        setLeaderboardEntries([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: 'url(/assets/images/b2.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 0, 130, 0.7)', // Purple overlay
    zIndex: 1
  };
  
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={overlayStyle}></div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-center mt-4 text-gray-700">Loading Leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Layout title="Leaderboard - QuizTime">
      <div style={containerStyle}>
        <div style={overlayStyle}></div>
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 2rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 md:space-y-8 border border-gray-100"
          >
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-8">
              <motion.button
                onClick={() => {
                  playSound('click');
                  router.push('/menu');
                }}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-yellow-600 transition-colors duration-200"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <BackIcon />
              </motion.button>
              
              <motion.h1 
                className="text-7xl font-bold text-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Leaderboard
              </motion.h1>
              <div className="w-24"></div>
            </div>

            {/* Leaderboard Table */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {leaderboardEntries.length > 0 ? (
                <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b">Rank</th>
                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b">Player</th>
                        <th className="px-6 py-4 text-right text-lg font-semibold text-gray-700 border-b">Prize Money</th>
                        <th className="px-6 py-4 text-right text-lg font-semibold text-gray-700 border-b">Questions</th>
                        <th className="px-6 py-4 text-right text-lg font-semibold text-gray-700 border-b">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardEntries.map((entry, index) => {
                        const isCurrentUser = currentUser && entry.username === currentUser.username;
                        const timeString = typeof entry.completionTime === 'number' && entry.completionTime > 0 
                          ? `${Math.floor(entry.completionTime / 60)}:${(entry.completionTime % 60).toString().padStart(2, '0')}`
                          : 'N/A';
                        
                        return (
                          <motion.tr 
                            key={`${entry.username}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-6 py-4 border-b">
                              <span className={`text-xl font-bold ${
                                index < 3 ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                #{index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 border-b">
                              <span className={`text-lg font-semibold ${
                                isCurrentUser ? 'text-blue-800' : 'text-gray-800'
                              }`}>
                                {entry.username} {isCurrentUser && '(You)'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right border-b">
                              <span className="text-lg font-bold text-green-600">
                                ${entry.prizeMoney.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right border-b">
                              <span className="text-lg font-semibold text-gray-800">
                                {entry.questionsAnswered}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right border-b">
                              <span className="text-lg font-semibold text-purple-600">
                                {timeString}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Players Yet</h3>
                  <p className="text-gray-600">Be the first to play and claim the top spot!</p>
                </div>
              )}
            </motion.div>

            {/* Back Button */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => {
                  playSound('click');
                  router.push('/menu');
                }}
                className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 max-w-xs mx-auto"
                style={{
                  background: 'linear-gradient(to right, #EAB308, #F59E0B)',
                  backgroundImage: 'linear-gradient(to right, #EAB308, #F59E0B)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  style: {
                    background: 'linear-gradient(to right, #CA8A04, #D97706)',
                    backgroundImage: 'linear-gradient(to right, #CA8A04, #D97706)'
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Leaderboards);
