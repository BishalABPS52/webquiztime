import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';

const Game = ({ username, gameState, setGameState, onGameOver }) => {
  const { playSound, stopSound, toggleMute, isMuted, difficulty, addHighScore } = useApp();
  
  // Extract values from gameState
  const { currentQuestion, score, timer: timeLeft } = gameState;
  
  // Local state that doesn't need to be shared with parent
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // State to store questions
  const [questions, setQuestions] = useState([]);
  
  // Load questions from JSON files
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Load questions from JSON files
        const easyResponse = await fetch('/assets/jsons/easy.json');
        const mediumResponse = await fetch('/assets/jsons/medium.json');
        const hardResponse = await fetch('/assets/jsons/hard.json');
        
        const easyData = await easyResponse.json();
        const mediumData = await mediumResponse.json();
        const hardData = await hardResponse.json();
        
        // Format questions for the game
        const formattedQuestions = [];
        
        // Add 5 easy questions
        easyData.questions.slice(0, 5).forEach(q => {
          const options = [q.correct, ...q.wrong.slice(0, 3)];
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          formattedQuestions.push({
            question: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct),
            difficulty: 'easy'
          });
        });
        
        // Add 5 medium questions
        mediumData.questions.slice(0, 5).forEach(q => {
          const options = [q.correct, ...q.wrong.slice(0, 3)];
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          formattedQuestions.push({
            question: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct),
            difficulty: 'medium'
          });
        });
        
        // Add 5 hard questions
        hardData.questions.slice(0, 5).forEach(q => {
          const options = [q.correct, ...q.wrong.slice(0, 3)];
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          formattedQuestions.push({
            question: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct),
            difficulty: 'hard'
          });
        });
        
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
        // Fallback to some default questions if loading fails
        setQuestions([
          {
            question: "What is the capital of France?",
            options: ["London", "Paris", "Berlin", "Madrid"],
            correctAnswer: 1,
            difficulty: 'easy'
          },
          {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctAnswer: 1,
            difficulty: 'easy'
          },
          {
            question: "What is the largest mammal?",
            options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            correctAnswer: 1,
            difficulty: 'easy'
          }
        ]);
      }
    };
    
    loadQuestions();
  }, []);

  const prizeAmounts = [
    25000, 50000, 100000, 200000, 400000, 800000, 1600000,
    3200000, 6400000, 12800000, 25600000, 51200000, 102400000,
    204800000, 700000000
  ];

  // Set time based on question difficulty and global difficulty setting
  const getTimeForQuestion = React.useCallback((questionIndex) => {
    let baseTime;
    if (questionIndex < 3) baseTime = 20;
    else if (questionIndex < 9) baseTime = 30;
    else baseTime = 45;
    
    // Adjust based on global difficulty setting
    switch(difficulty) {
      case 'easy':
        return baseTime * 1.5; // More time on easy mode
      case 'hard':
        return baseTime * 0.7; // Less time on hard mode
      default:
        return baseTime; // Normal time
    }
  }, [difficulty]);

  // Initialize or reset timer when current question changes
  useEffect(() => {
    if (currentQuestion < questions.length && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        timer: getTimeForQuestion(currentQuestion)
      }));
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowFeedback(false);
    }
  }, [currentQuestion, questions.length, gameState.gameOver, getTimeForQuestion, setGameState]);
  
  // Play background music when game starts
  useEffect(() => {
    if (questions.length > 0) {
      setTimeout(() => {
        playSound('background');
      }, 500);
    }
    
    return () => {
      stopSound('background');
    };
  }, [questions.length, playSound, stopSound]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || gameState.gameOver || showFeedback) return;

    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setGameState(prev => ({
          ...prev,
          timer: prev.timer - 1
        }));
        
        // Play timer sound when time is running low (less than 6 seconds)
        if (timeLeft <= 6) {
          playSound('timer');
        }
      } else {
        // Time's up
        setGameState(prev => ({
          ...prev,
          gameOver: true
        }));
        playSound('wrong'); // Play wrong sound when time's up
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameState.gameOver, showFeedback, playSound, setGameState]);

  // Handle answer selection
  const handleAnswerClick = (answerIndex) => {
    if (selectedAnswer !== null || gameState.gameOver) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Track this question in history
    setGameState(prev => ({
      ...prev,
      questionHistory: [
        ...prev.questionHistory, 
        { 
          question: questions[currentQuestion].question,
          selectedAnswer: answerIndex,
          correctAnswer: questions[currentQuestion].correctAnswer,
          isCorrect: correct 
        }
      ]
    }));
    
    // Play the appropriate sound effect
    if (correct) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    // Show feedback for 2 seconds then proceed
    setTimeout(() => {
      setShowFeedback(false);
      
      if (correct) {
        if (currentQuestion === questions.length - 1) {
          // Won the game!
          const finalScore = prizeAmounts[currentQuestion];
          setGameState(prev => ({
            ...prev,
            score: finalScore,
            gameOver: true,
            wonGame: true
          }));
          playSound('win');
        } else {
          // Go to next question
          setGameState(prev => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1,
            score: prizeAmounts[currentQuestion]
          }));
        }
      } else {
        // Game over on wrong answer
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          wonGame: false
        }));
      }
    }, 2000);
  };

  // Progress indicator
  const progressPercentage = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-6">
      {/* Header with info */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white"
        >
          <p className="text-xl font-bold">{username}</p>
          <p>Question {currentQuestion + 1} of {questions.length}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right text-white flex items-center"
        >
          <div className="mr-4">
            <p className="text-xl font-bold">Prize: ${score.toLocaleString()}</p>
            <p className="text-lg">
              <span className={timeLeft < 10 ? "text-red-400" : "text-white"}>
                Time: {timeLeft}s
              </span>
            </p>
          </div>
          
          {/* Sound toggle button */}
          <motion.button
            className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('click');
              toggleMute();
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </motion.button>
        </motion.div>
      </div>

      {/* Progress bar */}
      <motion.div 
        className="w-full max-w-4xl h-3 bg-gray-300 rounded-full my-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="h-full bg-green-500 rounded-full"
          initial={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Main game content */}
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        {!gameState.gameOver ? (
          <>
            {/* Question */}
            <motion.div 
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white w-full max-w-4xl p-6 mb-8 rounded-xl shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-4">
                {questions[currentQuestion].question}
              </h2>
            </motion.div>
            
            {/* Answer options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={`option-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    backgroundColor: showFeedback
                      ? (index === questions[currentQuestion].correctAnswer
                        ? 'rgb(34, 197, 94)' // Green for correct
                        : (index === selectedAnswer
                          ? 'rgb(239, 68, 68)' // Red for selected wrong
                          : 'rgb(255, 255, 255)')) // White for others
                      : 'rgb(255, 255, 255)'
                  }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.4,
                  }}
                  whileHover={!selectedAnswer && !gameState.gameOver ? { scale: 1.03 } : {}}
                  whileTap={!selectedAnswer && !gameState.gameOver ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null || gameState.gameOver}
                  className={`p-5 rounded-lg text-left text-lg font-medium shadow-md transition-colors
                    ${selectedAnswer === null && !gameState.gameOver 
                      ? 'hover:bg-blue-100 cursor-pointer' 
                      : 'cursor-default'}`}
                >
                  <span className="font-bold mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span> 
                  {option}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg p-8 rounded-xl shadow-xl text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            
            {isCorrect === false && (
              <p className="text-xl mb-6">Sorry, that was incorrect!</p>
            )}
            
            {gameState.wonGame && (
              <p className="text-xl mb-6">Congratulations! You've won the game!</p>
            )}
            
            <p className="text-2xl font-bold mb-6">
              You won: ${score.toLocaleString()}
            </p>

            {/* Save high score */}
            {score > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('click');
                  // Add score to high scores
                  addHighScore(username, score);
                  // Show a little confirmation
                  alert('Your score has been saved!');
                }}
                className="px-6 py-3 mb-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 w-full"
              >
                Save Score
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound('click');
                onGameOver({
                  currentQuestion: currentQuestion,
                  score: score,
                  gameOver: true,
                  wonGame: currentQuestion === questions.length && isCorrect
                });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700"
            >
              Return to Menu
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Prize money sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-lg hidden lg:block"
      >
        <div className="text-white font-bold">
          {prizeAmounts.map((prize, idx) => (
            <div 
              key={idx} 
              className={`py-1 px-3 mb-1 rounded ${idx === currentQuestion ? 'bg-yellow-500 text-black' : idx < currentQuestion ? 'bg-green-700' : 'bg-white/20'}`}
            >
              Q{idx + 1}: ${prize.toLocaleString()}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Game;
