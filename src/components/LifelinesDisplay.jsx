import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/game-context';
import { useApp } from '../context/app-context';

/**
 * Component for displaying and using lifelines during the game
 */
const LifelinesDisplay = ({ onUseLifeline }) => {
  const { playSound } = useApp();
  const { selectedLifelines, currentQuestion } = useGame();
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Get the appropriate icon based on lifeline ID
  const getLifelineIcon = (id) => {
    switch(id) {
      case 'fifty-fifty':
        return <span className="text-sm font-bold">50:50</span>;
      case 'skip':
        return <span className="text-xl">⏭️</span>;
      case 'change':
        return <span className="text-xl">🔄</span>;
      case 'pause':
        return <span className="text-xl">⏸️</span>;
      case 'double':
        return <span className="text-xl">🔄🎯</span>;
      default:
        return <span className="text-xl">❓</span>;
    }
  };
  
  // Get the description based on lifeline ID
  const getLifelineDescription = (id) => {
    switch(id) {
      case 'fifty-fifty':
        return 'Eliminates two incorrect answers';
      case 'skip':
        return 'Skip current question (no prize)';
      case 'change':
        return 'Replace with new question';
      case 'pause':
        return 'Pause timer for unlimited time';
      case 'double':
        return 'Get a second chance if wrong';
      default:
        return 'Special assistance';
    }
  };
  
  // Handle lifeline click
  const handleLifelineClick = (lifeline) => {
    // If already used, don't do anything
    if (lifeline.used) return;
    
    playSound('click');
    
    // Call the handler provided by parent component
    onUseLifeline(lifeline, currentQuestion);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-3 mb-4 relative"
    >
      {selectedLifelines.map((lifeline) => (
        <motion.div key={lifeline.id} className="relative">
          <motion.button
            whileHover={!lifeline.used ? { scale: 1.1 } : {}}
            whileTap={!lifeline.used ? { scale: 0.9 } : {}}
            onClick={() => handleLifelineClick(lifeline)}
            onMouseEnter={() => setShowTooltip(lifeline.id)}
            onMouseLeave={() => setShowTooltip(null)}
            disabled={lifeline.used}
            className={`p-2 rounded-full w-12 h-12 flex items-center justify-center transition-all 
              ${!lifeline.used 
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                : 'bg-gray-400 text-white/60 cursor-not-allowed'
              }`}
          >
            {getLifelineIcon(lifeline.id)}
            {lifeline.used && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-10 bg-red-500 rotate-45 rounded-full"></div>
                <div className="w-0.5 h-10 bg-red-500 -rotate-45 rounded-full"></div>
              </div>
            )}
          </motion.button>
          
          <AnimatePresence>
            {showTooltip === lifeline.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-md text-xs whitespace-nowrap z-10"
                style={{ minWidth: '120px' }}
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black"></div>
                <p className="font-bold">{lifeline.name || lifeline.id}</p>
                <p>{getLifelineDescription(lifeline.id)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default LifelinesDisplay;