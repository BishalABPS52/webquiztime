import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';

/**
 * Error Screen component shown when questions can't be loaded
 */
const ErrorScreen = ({ error, onRetry, onBack }) => {
  const { playSound } = useApp();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg p-8 bg-white rounded-xl shadow-xl text-center"
    >
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        {error?.isDemo ? "Using Demo Mode" : "Oops! Connection Issue"}
      </h2>
      
      <p className="text-lg text-gray-600 mb-4">
        {error?.details || "We couldn't connect to our quiz servers."}
      </p>
      
      {error?.isDemo ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-blue-700">
            You're currently playing with demo questions. The game will work normally, but your scores won't be saved to the leaderboard.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="font-medium text-yellow-800">Troubleshooting steps:</p>
          <ul className="text-left text-yellow-700 ml-5 list-disc">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>The server may be down for maintenance</li>
          </ul>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            onRetry();
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700"
        >
          {error?.isDemo ? "Continue with Demo" : "Try Again"}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg text-lg font-medium hover:bg-gray-300"
        >
          Back to Menu
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ErrorScreen;