import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/game-context';
import { useApp } from '../context/app-context';

const LifelineSelection = () => {
  const { availableLifelines, selectLifelines, startGame } = useGame();
  const { playSound } = useApp();
  
  // State to track selected lifelines
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');
  
  // Reset selections when component mounts
  useEffect(() => {
    setSelectedIds([]);
    setError('');
  }, []);
  
  // Handle lifeline selection
  const toggleLifelineSelection = (lifelineId) => {
    playSound('click');
    
    if (selectedIds.includes(lifelineId)) {
      // Remove from selection
      setSelectedIds(prev => prev.filter(id => id !== lifelineId));
      setError('');
    } else {
      // Add to selection if less than 2 are selected
      if (selectedIds.length < 2) {
        setSelectedIds(prev => [...prev, lifelineId]);
        setError('');
      } else {
        // Show error if attempting to select more than 2
        setError('You can only select 2 lifelines!');
      }
    }
  };
  
  // Proceed with selected lifelines
  const handleConfirm = () => {
    playSound('click');
    
    if (selectedIds.length === 0) {
      setError('You must select at least 1 lifeline!');
      return;
    }
    
    if (selectedIds.length > 2) {
      setError('You can only select up to 2 lifelines!');
      return;
    }
    
    // Save selections and start the game
    selectLifelines(selectedIds);
    startGame();
  };
  
  return (
    <div className="min-h-screen theme-gradient-bg p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Select Your Lifelines</h1>
        <p className="text-gray-600 text-center mb-8">
          Choose 1-2 lifelines to help you during the game
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-6 rounded-md text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableLifelines.map(lifeline => (
            <motion.div
              key={lifeline.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleLifelineSelection(lifeline.id)}
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                selectedIds.includes(lifeline.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">{lifeline.icon}</span>
                <h3 className="text-xl font-bold">{lifeline.name}</h3>
              </div>
              <p className="text-gray-600">{lifeline.description}</p>
              
              {selectedIds.includes(lifeline.id) && (
                <div className="mt-3 text-blue-600 font-semibold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700"
          >
            Start Game ({selectedIds.length}/2)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LifelineSelection;