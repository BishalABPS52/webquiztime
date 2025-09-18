import React, { createContext, useContext, useState } from 'react';
import { useApp } from './app-context';

// Create context
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { difficulty, addHighScore } = useApp();
  
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState([]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameScreen, setGameScreen] = useState('login'); // login, menu, game, stats, help
  
  // Load questions based on difficulty
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
      
      // Adjust number of questions based on difficulty
      let easyCount = 5;
      let mediumCount = 5;
      let hardCount = 5;
      
      switch(difficulty) {
        case 'easy':
          easyCount = 8;
          mediumCount = 5;
          hardCount = 2;
          break;
        case 'hard':
          easyCount = 3;
          mediumCount = 5;
          hardCount = 7;
          break;
        default:
          // Normal difficulty - keep default counts
          break;
      }
      
      // Add easy questions
      easyData.questions.slice(0, easyCount).forEach(q => {
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
      
      // Add medium questions
      mediumData.questions.slice(0, mediumCount).forEach(q => {
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
      
      // Add hard questions
      hardData.questions.slice(0, hardCount).forEach(q => {
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

  // Game navigation functions
  const startGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
    setGameInProgress(true);
    setGameScreen('game');
    loadQuestions();
  };
  
  const goToMenu = () => {
    setGameScreen('menu');
  };
  
  const goToStats = () => {
    setGameScreen('stats');
  };
  
  const goToHelp = () => {
    setGameScreen('help');
  };
  
  const login = (name) => {
    setUsername(name);
    setGameScreen('menu');
  };
  
  const logout = () => {
    setUsername('');
    setGameScreen('login');
  };
  
  // Add a score to high scores
  const saveScore = () => {
    addHighScore(username, score);
  };

  return (
    <GameContext.Provider value={{ 
      currentQuestion,
      setCurrentQuestion,
      score, 
      setScore,
      username,
      setUsername,
      questions,
      gameInProgress,
      setGameInProgress,
      gameOver,
      setGameOver,
      gameScreen,
      setGameScreen,
      
      // Navigation
      startGame,
      goToMenu,
      goToStats,
      goToHelp,
      login,
      logout,
      
      // Actions
      saveScore,
      loadQuestions
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);

export default GameContext;
