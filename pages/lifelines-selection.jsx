import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../src/context/game-context';
import { useApp } from '../src/context/app-context';

/**
 * Component for selecting lifelines before starting a game
 */
const LifelinesSelection = ({ onComplete }) => {
  const { playSound } = useApp();
  const { availableLifelines, selectLifelines, startGame } = useGame();
  
  // State to track which lifelines are selected
  const [selectedLifelineIds, setSelectedLifelineIds] = useState([]);
  const MAX_LIFELINES = 2; // Maximum number of lifelines a user can select
  
  // Handle lifeline toggle
  const toggleLifeline = (lifelineId) => {
    playSound('click');
    
    setSelectedLifelineIds(prev => {
      if (prev.includes(lifelineId)) {
        // Remove if already selected
        return prev.filter(id => id !== lifelineId);
      } else if (prev.length < MAX_LIFELINES) {
        // Add if less than max are selected
        return [...prev, lifelineId];
      }
      return prev;
    });
  };
  
  // Handle start game
  const handleStartGame = () => {
    if (selectedLifelineIds.length !== MAX_LIFELINES) {
      alert(`Please select exactly ${MAX_LIFELINES} lifelines to continue.`);
      return;
    }
    
    playSound('click');
    
    // Save selected lifelines
    selectLifelines(selectedLifelineIds);
    
    // Continue to the game
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen theme-gradient-bg px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-3xl p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-gray-100"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-center text-blue-600">Choose Your Lifelines</h1>
          <div className="h-1 w-24 bg-blue-600 rounded mb-4"></div>
          <p className="text-gray-700 text-center text-lg">
            Select exactly {MAX_LIFELINES} lifelines to help you during the game.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {availableLifelines.map((lifeline, index) => (
            <motion.div
              key={lifeline.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleLifeline(lifeline.id)}
              className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
                selectedLifelineIds.includes(lifeline.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{lifeline.name}</h3>
                  <p className="text-gray-600 leading-snug">{lifeline.description}</p>
                </div>
              </div>
              
              {selectedLifelineIds.includes(lifeline.id) && (
                <div className="mt-3 text-xs text-blue-600 font-medium">
                  ✓ Selected
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-gray-600">
            {selectedLifelineIds.length}/{MAX_LIFELINES} selected
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound('click');
                // Select first two lifelines automatically
                if (availableLifelines.length >= MAX_LIFELINES) {
                  const autoSelectedIds = availableLifelines.slice(0, MAX_LIFELINES).map(l => l.id);
                  selectLifelines(autoSelectedIds);
                  if (onComplete) {
                    onComplete();
                  }
                } else {
                  alert(`Not enough lifelines available. Need at least ${MAX_LIFELINES}.`);
                }
              }}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600"
            >
              Auto-select
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className={`px-5 py-2.5 rounded-lg font-medium ${
                selectedLifelineIds.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedLifelineIds.length === 0}
            >
              Continue
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LifelinesSelection;