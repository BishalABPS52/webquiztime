import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../src/context/app-context';
import { useRouter } from 'next/router';
import QuizTimeAPI from '../src/services/api';
import withAuth from '../src/utils/withAuth';

// Icon components
const PlayIcon = () => (
  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StatsIcon = () => (
  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h2v7H3v-7zm4-6h2v13H7V7zm4-4h2v17h-2V3zm4 8h2v9h-2v-9z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20.38C20.8 4 21.08 4.5 20.83 4.86L18.96 7.5C19.61 8.29 20 9.3 20 10.38V14C20 15.1 19.1 16 18 16H16V19C16 20.1 15.1 21 14 21H10C8.9 21 8 20.1 8 19V16H6C4.9 16 4 15.1 4 14V10.38C4 9.3 4.39 8.29 5.04 7.5L3.17 4.86C2.92 4.5 3.2 4 3.62 4H7Z"/>
  </svg>
);

const HelpIcon = () => (
  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

const Menu = () => {
  const router = useRouter();
  const { 
    playSound, 
    toggleMusic, 
    isMusicMuted, 
    musicVolume, 
    adjustMusicVolume, 
    isSoundEffectsMuted,
    toggleSoundEffects,
    soundEffectsVolume,
    adjustEffectsVolume
  } = useApp();

  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Start background music when component mounts
  useEffect(() => {
    playSound('background');
    
    // Load user data
    const loadUserData = async () => {
      try {
        const data = await QuizTimeAPI.getUserProfile();
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    playSound('click');
    QuizTimeAPI.logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 px-4 py-6 md:px-8">
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Settings</h3>
              
              {/* Background Music Control */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">Background Music</span>
                  <button
                    onClick={() => {
                      playSound('click');
                      toggleMusic();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isMusicMuted ? 'bg-gray-200' : 'bg-blue-600'
                    }`}
                  >
                    <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isMusicMuted ? 'translate-x-1' : 'translate-x-6'
                    }`}></div>
                  </button>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={musicVolume}
                  onChange={(e) => adjustMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Sound Effects Control */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">Sound Effects</span>
                  <button
                    onClick={() => {
                      playSound('click');
                      toggleSoundEffects();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isSoundEffectsMuted ? 'bg-gray-200' : 'bg-blue-600'
                    }`}
                  >
                    <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSoundEffectsMuted ? 'translate-x-1' : 'translate-x-6'
                    }`}></div>
                  </button>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={soundEffectsVolume}
                  onChange={(e) => adjustEffectsVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <button
                onClick={() => {
                  playSound('click');
                  setShowSettings(false);
                }}
                className="w-full py-3 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Close Settings
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-5 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex flex-col items-center justify-center">
          <motion.img 
            src="/assets/images/QuizTime.png" 
            alt="QuizTime Logo" 
            className="h-32 w-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          />
          <motion.h2 
            className="mt-4 text-3xl font-extrabold text-center text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome, {userData ? userData.username : 'Player'}!
          </motion.h2>
          <motion.p 
            className="mt-2 text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Win up to $700,000,000!
          </motion.p>
        </div>
        
        <motion.div 
          className="mt-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <motion.button
              type="button"
              onClick={() => {
                playSound('click');
                router.push('/game');
              }}
              className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
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
              <PlayIcon />
              Start Game
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                playSound('click');
                router.push('/stats');
              }}
              className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              style={{
                background: 'linear-gradient(to right, #F59E0B, #EAB308)',
                backgroundImage: 'linear-gradient(to right, #F59E0B, #EAB308)'
              }}
              whileHover={{ 
                scale: 1.05,
                style: {
                  background: 'linear-gradient(to right, #D97706, #CA8A04)',
                  backgroundImage: 'linear-gradient(to right, #D97706, #CA8A04)'
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <StatsIcon />
              Stats
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                playSound('click');
                router.push('/leaderboard');
              }}
              className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              style={{
                background: 'linear-gradient(to right, #FCD34D, #EAB308)',
                backgroundImage: 'linear-gradient(to right, #FCD34D, #EAB308)'
              }}
              whileHover={{ 
                scale: 1.05,
                style: {
                  background: 'linear-gradient(to right, #EAB308, #CA8A04)',
                  backgroundImage: 'linear-gradient(to right, #EAB308, #CA8A04)'
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <TrophyIcon />
              Leaderboards
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                playSound('click');
                router.push('/help');
              }}
              className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              style={{
                background: 'linear-gradient(to right, #FDE047, #FCD34D)',
                backgroundImage: 'linear-gradient(to right, #FDE047, #FCD34D)'
              }}
              whileHover={{ 
                scale: 1.05,
                style: {
                  background: 'linear-gradient(to right, #FCD34D, #EAB308)',
                  backgroundImage: 'linear-gradient(to right, #FCD34D, #EAB308)'
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpIcon />
              Help
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                playSound('click');
                handleLogout();
              }}
              className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              style={{
                background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                backgroundImage: 'linear-gradient(to right, #F59E0B, #EF4444)'
              }}
              whileHover={{ 
                scale: 1.05,
                style: {
                  background: 'linear-gradient(to right, #D97706, #DC2626)',
                  backgroundImage: 'linear-gradient(to right, #D97706, #DC2626)'
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <LogoutIcon />
              Logout
            </motion.button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowSettings(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default withAuth(Menu);
