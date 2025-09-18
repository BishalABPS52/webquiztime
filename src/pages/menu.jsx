import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/app-context';

const Menu = ({ username, onStartGame, onStats, onLeaderboards, onHelp, onLogout }) => {
  const { playSound, toggleMute, isMuted, volume, adjustVolume, theme, changeTheme } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const buttonEffects = {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95 }
  };
  
  // Helper to play sound when clicking buttons
  const handleButtonClick = (callback) => {
    playSound('click');
    callback();
  };

  // Get theme-based container styles
  const getContainerClass = () => {
    switch(theme) {
      case 'dark':
        return 'flex items-center justify-center min-h-screen';
      case 'light':
        return 'flex items-center justify-center min-h-screen';
      default:
        return 'flex items-center justify-center min-h-screen';
    }
  };

  return (
    <div className={getContainerClass()}>
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl w-80"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Settings</h3>
              
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!isMuted}
                    onChange={() => {
                      playSound('click');
                      toggleMute();
                    }}
                    className="w-4 h-4 mr-2" 
                  />
                  <span>Sound Effects</span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">Volume</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume}
                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                  className="w-full" 
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeTheme('default')}
                    className={`px-3 py-2 rounded ${theme === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`px-3 py-2 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => changeTheme('light')}
                    className={`px-3 py-2 rounded ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Light
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  playSound('click');
                  setShowSettings(false);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center relative w-full">
          {/* Sound toggle button */}
          <motion.button
            className="absolute top-0 right-0 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('click');
              setShowSettings(true);
            }}
          >
            ⚙️
          </motion.button>
          
          <motion.img 
            src="/assets/images/QuizTime.png" 
            alt="QuizTime Logo" 
            className="h-48 w-auto mb-4" /* Increased from h-32 to h-48 (1.5x) */
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />
          
          <motion.h2 
            className="mt-2 text-3xl font-extrabold text-center text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome, {username}!
          </motion.h2>
          
          <motion.p 
            className="mt-2 text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ready to win $700,000,000?
          </motion.p>
        </div>
        
        <motion.div
          className="mt-8 space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.button
            variants={item}
            {...buttonEffects}
            onClick={() => handleButtonClick(onStartGame)}
            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Start Game
          </motion.button>
          
          <motion.button
            variants={item}
            {...buttonEffects}
            onClick={() => handleButtonClick(onStats)}
            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:from-purple-600 hover:to-pink-600"
          >
            Stats
          </motion.button>
          
          <motion.button
            variants={item}
            {...buttonEffects}
            onClick={() => handleButtonClick(onLeaderboards)}
            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:from-blue-600 hover:to-indigo-600"
          >
            Leaderboards
          </motion.button>
          
          <motion.button
            variants={item}
            {...buttonEffects}
            onClick={() => handleButtonClick(onHelp)}
            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 hover:from-yellow-600 hover:to-orange-600"
          >
            Help
          </motion.button>
          
          <motion.button
            variants={item}
            {...buttonEffects}
            onClick={() => handleButtonClick(onLogout)}
            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-gradient-to-r from-red-500 to-red-700 rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:from-red-600 hover:to-red-800"
          >
            Logout
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Menu;
