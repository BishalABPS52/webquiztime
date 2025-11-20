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



const Stats = () => {
  const router = useRouter();
  const { playSound } = useApp();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user data
        const profile = await QuizTimeAPI.getUserProfile();
        setUserData(profile);
        
        // Fetch real stats from backend
        if (profile?.username) {
          console.log('Fetching stats for user:', profile.username);
          const userStatsResponse = await QuizTimeAPI.getUserStats(profile.username);
          console.log('Stats response:', userStatsResponse);
          
          if (userStatsResponse?.stats) {
            const backendStats = userStatsResponse.stats;
            
            // Transform backend stats to match our UI format (handles both MongoDB and JSON data)
            const transformedStats = {
              gamesPlayed: backendStats.gamesPlayed || 0,
              gamesWon: backendStats.gamesCompleted || backendStats.gamesWon || 0,
              totalEarnings: backendStats.totalPrizeMoney || backendStats.totalEarnings || backendStats.score || 0,
              correctAnswers: backendStats.correctAnswers || 0,
              answersPercentage: backendStats.accuracy || (backendStats.correctAnswers > 0 ? 
                Math.round((backendStats.correctAnswers / (backendStats.correctAnswers + (backendStats.wrongAnswers || 0))) * 100) : 0),
              averageTime: backendStats.averageCompletionTime || (backendStats.averageTimePerQuestion > 0 ? 
                `${Math.floor(backendStats.averageTimePerQuestion / 60)}:${String(Math.floor(backendStats.averageTimePerQuestion % 60)).padStart(2, '0')}` : 
                '0:00')
            };
            
            console.log('Transformed stats for user:', profile.username, transformedStats);
            setUserStats(transformedStats);
          } else {
            console.log('No stats found, using defaults');
            // No stats found - set defaults for new user
            setUserStats({
              gamesPlayed: 0,
              gamesWon: 0,
              totalEarnings: 0,
              correctAnswers: 0,
              answersPercentage: 0,
              averageTime: '0:00'
            });
          }
        } else {
          console.log('No username available');
          // No username available
          setUserStats({
            gamesPlayed: 0,
            gamesWon: 0,
            totalEarnings: 0,
            correctAnswers: 0,
            answersPercentage: 0,
            averageTime: '0:00'
          });
        }
      } catch (error) {
        // Fallback stats
        setUserData({ username: 'Player' });
        setUserStats({
          gamesPlayed: 0,
          gamesWon: 0,
          totalEarnings: 0,
          correctAnswers: 0,
          answersPercentage: 0,
          averageTime: '0:00'
        });
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
          <p className="text-center mt-4 text-gray-700">Loading Stats...</p>
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
              Player Stats
            </motion.h1>
            <div className="w-24"></div>
          </div>

          {/* Welcome Section */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome back, {userData?.username || 'Player'}!
            </h2>
            <p className="text-gray-600">Here's a summary of your QuizTime journey</p>
          </motion.div>

          {/* Stats Table */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 border-b">Statistic</th>
                    <th className="px-6 py-4 text-right text-lg font-semibold text-gray-700 border-b">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium border-b">Games Played</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-gray-900 border-b">{userStats.gamesPlayed}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium border-b">Games Completed</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-gray-900 border-b">{userStats.gamesWon}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium border-b">Total Prize Money</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-green-600 border-b">${userStats.totalEarnings.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium border-b">Questions Answered</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-gray-900 border-b">{userStats.correctAnswers}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium border-b">Accuracy</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-blue-600 border-b">{userStats.answersPercentage}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium">Average Completion Time</td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-purple-600">{userStats.averageTime || '0:00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>


        </motion.div>
    </div>
  );
};



export default withAuth(Stats);
