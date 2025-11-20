import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useApp } from '../src/context/app-context';
import QuizTimeAPI from '../src/services/api';
import withAuth from '../src/utils/withAuth';

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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900" 
           style={{
             backgroundImage: 'url(/assets/images/b2.jpg)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-700">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 px-4 py-6 md:px-8" 
         style={{
           backgroundImage: 'url(/assets/images/b2.jpg)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
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
              <span className="ml-2 font-medium">Back to Menu</span>
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
                      <th className="px-6 py-4 text-right text-lg font-semibold text-gray-700 border-b">Completion Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardEntries.map((entry, index) => {
                      const isCurrentUser = entry.username === currentUser?.username;
                      const minutes = Math.floor(entry.completionTime / 60);
                      const seconds = entry.completionTime % 60;
                      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                      
                      return (
                        <motion.tr 
                          key={`${entry.username}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`hover:bg-gray-50 transition-colors ${
                            isCurrentUser ? 'bg-blue-50' : ''
                          }`}
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


        </motion.div>
    </div>
  );
};

export default withAuth(Leaderboards);
