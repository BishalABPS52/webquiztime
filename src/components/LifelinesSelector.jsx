import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/game-context';
import { useApp } from '../context/app-context';

/**
 * Component for selecting lifelines before starting the game
 */
const LifelinesSelector = () => {
  const { playSound, theme } = useApp();
  const { availableLifelines, selectLifelines, startGame, goToMenu } = useGame();
  
  // State for selected lifeline IDs
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionError, setSelectionError] = useState('');
  const [showRules, setShowRules] = useState(false);
  
  // Define max and min number of lifelines
  const MAX_LIFELINES = 2;
  const MIN_LIFELINES = 2;
  
  // Handle lifeline selection/deselection
  const toggleLifeline = (id) => {
    playSound('click');
    
    // If already selected, deselect it
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
      setSelectionError('');
    } 
    // If not selected and below max limit, select it
    else if (selectedIds.length < MAX_LIFELINES) {
      setSelectedIds([...selectedIds, id]);
      setSelectionError('');
    } 
    // If trying to select more than max allowed
    else {
      setSelectionError(`You can only select ${MAX_LIFELINES} lifelines.`);
    }
  };
  
  // Toggle rules visibility
  const toggleRules = () => {
    playSound('click');
    setShowRules(!showRules);
  };
  
  // Start the game with selected lifelines
  const handleStartGame = () => {
    if (selectedIds.length < MIN_LIFELINES) {
      setSelectionError(`Please select at least ${MIN_LIFELINES} lifelines.`);
      return;
    }
    
    playSound('click');
    selectLifelines(selectedIds);
    startGame();
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center mb-4 text-white">
          Select Your Lifelines
        </h2>
        
        <p className="text-center text-white mb-4">
          Choose {MIN_LIFELINES}-{MAX_LIFELINES} lifelines that will help you during the game.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRules}
          className="mx-auto block px-4 py-2 mb-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          {showRules ? 'Hide Game Rules' : 'Show Game Rules'}
        </motion.button>
        
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-black/40 text-white rounded-lg overflow-auto max-h-96"
          >
            <h3 className="text-xl font-bold mb-3 text-yellow-300">Game Rules & Features</h3>
            
            <div className="mb-4">
              <p className="font-semibold text-yellow-200">• 15 Questions 🧠</p>
              <p className="ml-4 text-sm">A mix of knowledge that grows more difficult as you progress.</p>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold text-yellow-200">• Randomized Questions 🔀</p>
              <p className="ml-4 text-sm">Enjoy fair and unpredictable gameplay.</p>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold text-yellow-200">• Time Limits for Fair Play ⏳</p>
              <ul className="ml-4 text-sm">
                <li>Q1 - Q3: 20 seconds ⏱️</li>
                <li>Q4 - Q9: 30 seconds ⏱️</li>
                <li>Q10 - Q15: 45 seconds ⏱️</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold text-yellow-200">• Prize Money Structure 💵</p>
              <div className="ml-4 grid grid-cols-2 gap-2 text-sm">
                <div>🥉 Q1: $25,000</div>
                <div>🏅 Q8: $3,200,000</div>
                <div>🥉 Q2: $50,000</div>
                <div>🏅 Q9: $6,400,000</div>
                <div>🥉 Q3: $100,000</div>
                <div>🏆 Q10: $12,800,000</div>
                <div>🥈 Q4: $200,000</div>
                <div>🏆 Q11: $25,600,000</div>
                <div>🥈 Q5: $400,000</div>
                <div>🏆 Q12: $51,200,000</div>
                <div>🥈 Q6: $800,000</div>
                <div>🎖 Q13: $102,400,000</div>
                <div>🏅 Q7: $1,600,000</div>
                <div>🎖 Q14: $204,800,000</div>
                <div colSpan="2" className="text-center text-yellow-300 font-bold">🎖 Q15: $700,000,000 🏆🎉</div>
              </div>
            </div>
            
            <div className="text-red-400 font-bold">
              ⚠️ One Wrong Answer Ends the Game! ❌
            </div>
          </motion.div>
        )}
        
        {selectionError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500/70 text-white rounded-md text-center"
          >
            {selectionError}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <motion.div
            key="fifty-fifty"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLifeline("fifty-fifty")}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes("fifty-fifty")
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-3">50:50</div>
              <div>
                <h3 className="font-bold">50-50</h3>
                <p className="text-sm">Eliminates two incorrect answers, leaving only one incorrect and the correct answer.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            key="skip"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLifeline("skip")}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes("skip")
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏭️</div>
              <div>
                <h3 className="font-bold">Skip</h3>
                <p className="text-sm">Skip current question and move to next one. Prize money not added for skipped questions.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            key="change"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLifeline("change")}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes("change")
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄</div>
              <div>
                <h3 className="font-bold">Change Question</h3>
                <p className="text-sm">Replace current question with a new one of same difficulty level.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            key="pause"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLifeline("pause")}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes("pause")
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏸️</div>
              <div>
                <h3 className="font-bold">Pause Timer</h3>
                <p className="text-sm">Pauses the timer and gives unlimited time for the current question.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            key="double"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleLifeline("double")}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes("double")
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄🎯</div>
              <div>
                <h3 className="font-bold">Double Chance</h3>
                <p className="text-sm">Get a second attempt if your first answer is wrong on the current question.</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToMenu}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
          >
            Back to Menu
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            disabled={selectedIds.length < MIN_LIFELINES}
            className={`px-6 py-3 text-white rounded-lg font-medium ${
              selectedIds.length >= MIN_LIFELINES
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Start Game ({selectedIds.length}/{MAX_LIFELINES})
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LifelinesSelector;