import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';

const Leaderboards = ({ username, onBack }) => {
  const { playSound } = useApp();
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  
  useEffect(() => {
    // Get all user stats from localStorage
    const stats = JSON.parse(localStorage.getItem('quiztime-stats') || '{}');
    
    // Convert stats to leaderboard entries
    const entries = Object.entries(stats)
      .map(([playerName, playerStats]) => ({
        username: playerName,
        score: playerStats.highestEarning || 0,
        gamesPlayed: playerStats.gamesPlayed || 0,
        gamesWon: playerStats.gamesWon || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Take top 10
      
    setLeaderboardEntries(entries);
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Top Players
          </motion.h2>
          <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
        </div>

        {leaderboardEntries.length > 0 ? (
          <div className="overflow-hidden bg-white shadow sm:rounded-lg mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardEntries.map((entry, index) => (
                  <motion.tr 
                    key={entry.username}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={entry.username === username ? "bg-blue-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.username} {entry.username === username && "(You)"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${entry.score.toLocaleString()}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">No high scores yet. Be the first to play!</p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound('click');
              onBack();
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700"
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboards;
