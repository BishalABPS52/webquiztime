import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';
import { useGame } from '../context/game-context';

const Stats = ({ onBack }) => {
  const { highScores } = useApp();
  const { username } = useGame();
  
  // Sample stats (replace with actual user stats from context/storage)
  const userStats = {
    gamesPlayed: 12,
    gamesWon: 3,
    totalEarnings: 1756000,
    highestLevel: 9,
    highestEarning: 800000,
    averageScore: 350000,
    correctAnswers: 78,
    incorrectAnswers: 9,
    answersPercentage: 90
  };

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
            {username} Stats.
          </motion.h2>
          <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard 
            title="Games Played" 
            value={userStats.gamesPlayed} 
            delay={0.1}
          />
          <StatsCard 
            title="Games Completed" 
            value={userStats.gamesWon} 
            delay={0.2}
          />
          <StatsCard 
            title="Total Earnings" 
            value={`$${userStats.totalEarnings.toLocaleString()}`} 
            delay={0.3}
          />
          <StatsCard 
            title="Highest Level" 
            value={`Q${userStats.highestLevel}`} 
            delay={0.4}
          />
          <StatsCard 
            title="Highest Earning" 
            value={`$${userStats.highestEarning.toLocaleString()}`} 
            delay={0.5}
          />
          <StatsCard 
            title="Answer Success Rate" 
            value={`${userStats.answersPercentage}%`} 
            delay={0.6}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700"
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Stats card component
const StatsCard = ({ title, value, icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-50 p-4 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="text-lg text-gray-500 font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Stats;
