import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const GameContext = createContext();

// Sample quiz data (replace with your actual data or API fetch)
const quizData = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: 1,
    difficulty: 1
  },
  {
    id: 2,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Claude Monet"],
    correctAnswer: 1,
    difficulty: 1
  },
  {
    id: 3,
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: 1,
    difficulty: 1
  },
  // Add more questions here...
];

// Prize money structure
const prizeAmounts = [
  25000, 50000, 100000, 200000, 400000, 800000, 1600000,
  3200000, 6400000, 12800000, 25600000, 51200000, 102400000,
  204800000, 700000000
];

// Provider component
export const GameProvider = ({ children }) => {
  // User state
  const [username, setUsername] = useState(() => {
    const savedUsername = localStorage.getItem('quiztime-username');
    return savedUsername || '';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('quiztime-username'));
  });

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  
  // Screen state
  const [currentScreen, setCurrentScreen] = useState('login'); // login, menu, game, stats, help
  
  // Stats state
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('quiztime-stats');
    return savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: 0,
      highestLevel: 0,
      highestEarning: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      answersPercentage: 0
    };
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);

  // Load questions and shuffle them
  useEffect(() => {
    if (gameActive) {
      // Shuffle the questions and select 15
      const shuffledQuestions = [...quizData].sort(() => 0.5 - Math.random()).slice(0, 15);
      setQuestions(shuffledQuestions);
    }
  }, [gameActive]);
  
  // Save user data to localStorage when it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('quiztime-username', username);
    }
  }, [username]);
  
  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('quiztime-stats', JSON.stringify(stats));
  }, [stats]);

  // Login user
  const login = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    setCurrentScreen('menu');
  };

  // Logout user
  const logout = () => {
    setUsername('');
    setIsLoggedIn(false);
    setCurrentScreen('login');
    localStorage.removeItem('quiztime-username');
  };

  // Start a new game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setCurrentQuestion(0);
    setScore(0);
    setCurrentScreen('game');
    
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      gamesPlayed: prevStats.gamesPlayed + 1
    }));
  };

  // End the game
  const endGame = (won = false, finalQuestion = currentQuestion) => {
    setGameActive(false);
    setGameOver(true);
    
    // Update stats
    setStats(prevStats => {
      const newTotalEarnings = prevStats.totalEarnings + score;
      const newHighestLevel = Math.max(prevStats.highestLevel, finalQuestion + 1);
      const newHighestEarning = Math.max(prevStats.highestEarning, score);
      
      return {
        ...prevStats,
        gamesWon: won ? prevStats.gamesWon + 1 : prevStats.gamesWon,
        totalEarnings: newTotalEarnings,
        highestLevel: newHighestLevel,
        highestEarning: newHighestEarning
      };
    });
  };

  // Answer a question
  const answerQuestion = (isCorrect) => {
    if (isCorrect) {
      // Correct answer
      const newScore = prizeAmounts[currentQuestion];
      setScore(newScore);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        correctAnswers: prevStats.correctAnswers + 1,
        answersPercentage: Math.round((prevStats.correctAnswers + 1) / (prevStats.correctAnswers + prevStats.incorrectAnswers + 1) * 100)
      }));
      
      if (currentQuestion === 14) {
        // Won the game
        endGame(true, 14);
      } else {
        // Go to next question
        setCurrentQuestion(currentQuestion + 1);
      }
    } else {
      // Wrong answer
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        incorrectAnswers: prevStats.incorrectAnswers + 1,
        answersPercentage: Math.round(prevStats.correctAnswers / (prevStats.correctAnswers + prevStats.incorrectAnswers + 1) * 100)
      }));
      
      endGame(false);
    }
  };

  // Navigation functions
  const goToMenu = () => setCurrentScreen('menu');
  const goToStats = () => setCurrentScreen('stats');
  const goToHelp = () => setCurrentScreen('help');

  // Value to be provided
  const contextValue = {
    // User state
    username,
    isLoggedIn,
    
    // Game state
    currentQuestion,
    score,
    gameOver,
    gameActive,
    questions,
    prizeAmounts,
    
    // Screen state
    currentScreen,
    
    // Stats
    stats,
    
    // Functions
    login,
    logout,
    startGame,
    endGame,
    answerQuestion,
    goToMenu,
    goToStats,
    goToHelp
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
