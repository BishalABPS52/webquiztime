import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LifelinesBar = ({ lifelines, onUseLifeline }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  // Get the appropriate icon based on lifeline ID
  const getLifelineIcon = (id, icon) => {
    switch(id) {
      case 'fifty-fifty':
        return <span className="text-sm font-bold">50:50</span>;
      case 'skip':
        return <span>⏭️</span>;
      case 'change':
        return <span>🔄</span>;
      case 'pause':
        return <span>⏸️</span>;
      case 'double':
        return <span>🔄🎯</span>;
      default:
        return icon || <span>❓</span>;
    }
  };
  
  // Get the name based on lifeline ID if not provided
  const getLifelineName = (lifeline) => {
    if (lifeline.name) return lifeline.name;
    
    switch(lifeline.id) {
      case 'fifty-fifty': return '50-50';
      case 'skip': return 'Skip Question';
      case 'change': return 'Change Question';
      case 'pause': return 'Pause Timer';
      case 'double': return 'Double Chance';
      default: return lifeline.id;
    }
  };
  
  // Get the description based on lifeline ID if not provided
  const getLifelineDescription = (lifeline) => {
    if (lifeline.description) return lifeline.description;
    
    switch(lifeline.id) {
      case 'fifty-fifty': 
        return 'Eliminates two incorrect answers, leaving one wrong and one correct answer.';
      case 'skip': 
        return 'Skip current question and move to the next one. No prize money for skipped question.';
      case 'change': 
        return 'Replace current question with a new one of the same difficulty level.';
      case 'pause': 
        return 'Pause the timer and get unlimited time for the current question.';
      case 'double': 
        return 'Get a second chance if your first answer is wrong on this question.';
      default: 
        return 'Special assistance';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center space-x-3 my-4 relative"
    >
      {lifelines.map((lifeline) => (
        <motion.div key={lifeline.id} className="relative">
          <motion.button
            whileHover={!lifeline.used ? { scale: 1.1 } : {}}
            whileTap={!lifeline.used ? { scale: 0.95 } : {}}
            onClick={() => !lifeline.used && onUseLifeline(lifeline.id)}
            onMouseEnter={() => setActiveTooltip(lifeline.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            disabled={lifeline.used}
            className={`p-3 rounded-full w-12 h-12 flex items-center justify-center ${
              lifeline.used
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
            }`}
          >
            <span className="text-xl">{getLifelineIcon(lifeline.id, lifeline.icon)}</span>
            <span className="sr-only">{getLifelineName(lifeline)}</span>
            
            {lifeline.used && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-10 bg-red-500 rotate-45 rounded-full"></div>
                <div className="w-0.5 h-10 bg-red-500 -rotate-45 rounded-full"></div>
              </div>
            )}
          </motion.button>
          
          <AnimatePresence>
            {activeTooltip === lifeline.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-2 rounded text-xs whitespace-nowrap z-20"
                style={{ minWidth: '150px' }}
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black"></div>
                <p className="font-bold mb-1">{getLifelineName(lifeline)}</p>
                <p>{getLifelineDescription(lifeline)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default LifelinesBar;