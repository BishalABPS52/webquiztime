import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './app-context';
import QuizTimeAPI from '../services/api';

// Create context
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { difficulty, addHighScore } = useApp();
  
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState([]);
  const [alternateQuestions, setAlternateQuestions] = useState([]); // For lifelines like "change question"
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameScreen, setGameScreen] = useState('login'); // login, menu, game, stats, help
  const [loading, setLoading] = useState(false);
  const [availableLifelines, setAvailableLifelines] = useState([]); // All available lifelines
  const [selectedLifelines, setSelectedLifelines] = useState([]); // User selected lifelines for the game
  
  // Load questions based on difficulty
  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Calculate question counts based on difficulty
      // We need to load extra questions for the "change question" lifeline
      let easyCount = 6; // 5 + 1 extra
      let mediumCount = 6; // 5 + 1 extra
      let hardCount = 6;   // 5 + 1 extra
      
      switch(difficulty) {
        case 'easy':
          easyCount = 10; // 8 + 2 extra
          mediumCount = 6; // 5 + 1 extra
          hardCount = 2;  // No extra for hard on easy difficulty
          break;
        case 'hard':
          easyCount = 3;  // No extra for easy on hard difficulty
          mediumCount = 6; // 5 + 1 extra
          hardCount = 9;  // 7 + 2 extra
          break;
        default:
          // Normal difficulty - use default counts with extras
          break;
      }
      
      // Use API service to load questions
      const formattedQuestions = [];
      const alternateQuestions = []; // For the "change question" lifeline
      
      // Fetch questions for each difficulty level
      const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
        QuizTimeAPI.getQuestions(username, 'easy', easyCount),
        QuizTimeAPI.getQuestions(username, 'medium', mediumCount),
        QuizTimeAPI.getQuestions(username, 'hard', hardCount)
      ]);
      
      // Process and format API responses
      const processQuestions = (questions, difficultyLevel, mainCount) => {
        if (!questions || !questions.questions || !questions.questions.length) return;
        
        // Take only what we need for main questions and alternates
        const mainQuestions = questions.questions.slice(0, mainCount);
        const altQuestions = questions.questions.slice(mainCount);
        
        // Process main questions
        mainQuestions.forEach(q => {
          const options = [q.correct_answer, ...q.incorrect_answers];
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          formattedQuestions.push({
            id: q.id || Math.random().toString(36).substr(2, 9),
            question: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct_answer),
            difficulty: difficultyLevel
          });
        });
        
        // Process alternate questions for lifelines
        altQuestions.forEach(q => {
          const options = [q.correct_answer, ...q.incorrect_answers];
          // Shuffle options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          alternateQuestions.push({
            id: q.id || Math.random().toString(36).substr(2, 9),
            question: q.question,
            options: options,
            correctAnswer: options.indexOf(q.correct_answer),
            difficulty: difficultyLevel
          });
        });
      };
      
      // Define how many main questions we want from each difficulty
      const mainEasyCount = difficulty === 'easy' ? 8 : (difficulty === 'hard' ? 3 : 5);
      const mainMediumCount = 5;
      const mainHardCount = difficulty === 'hard' ? 7 : (difficulty === 'easy' ? 2 : 5);
      
      // Process each difficulty level
      processQuestions(easyQuestions, 'easy', mainEasyCount);
      processQuestions(mediumQuestions, 'medium', mainMediumCount);
      processQuestions(hardQuestions, 'hard', mainHardCount);
      
      setQuestions(formattedQuestions);
      setAlternateQuestions(alternateQuestions);
    } catch (error) {
      console.error("Failed to load questions from API:", error);
      
      // Fallback: try to load questions from JSON files if API fails
      try {
        // Load questions from JSON files as backup
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
        
        // Define how many main questions we want from each difficulty (same as above)
        const mainEasyCount = difficulty === 'easy' ? 8 : (difficulty === 'hard' ? 3 : 5);
        const mainMediumCount = 5;
        const mainHardCount = difficulty === 'hard' ? 7 : (difficulty === 'easy' ? 2 : 5);
        
        // Process questions and split between main and alternate
        const processFallbackQuestions = (data, level, mainCount) => {
          // Get main questions
          const mainData = data.slice(0, mainCount);
          mainData.forEach(q => {
            const options = [q.correct, ...q.wrong.slice(0, 3)];
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }
            
            formattedQuestions.push({
              id: Math.random().toString(36).substr(2, 9),
              question: q.question,
              options: options,
              correctAnswer: options.indexOf(q.correct),
              difficulty: level
            });
          });
          
          // Get alternate questions
          const altData = data.slice(mainCount, easyCount);
          altData.forEach(q => {
            const options = [q.correct, ...q.wrong.slice(0, 3)];
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }
            
            alternateQuestions.push({
              id: Math.random().toString(36).substr(2, 9),
              question: q.question,
              options: options,
              correctAnswer: options.indexOf(q.correct),
              difficulty: level
            });
          });
        };
        
        // Process each difficulty level
        processFallbackQuestions(easyData.questions, 'easy', mainEasyCount);
        processFallbackQuestions(mediumData.questions, 'medium', mainMediumCount);
        processFallbackQuestions(hardData.questions, 'hard', mainHardCount);
        
        setQuestions(formattedQuestions);
        setAlternateQuestions(alternateQuestions);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        // Ultimate fallback - hardcoded questions
        const hardcodedQuestions = [
          {
            id: '1',
            question: "What is the capital of France?",
            options: ["London", "Paris", "Berlin", "Madrid"],
            correctAnswer: 1,
            difficulty: 'easy'
          },
          {
            id: '2',
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctAnswer: 1,
            difficulty: 'easy'
          },
          {
            id: '3',
            question: "What is the largest mammal?",
            options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            correctAnswer: 1,
            difficulty: 'easy'
          },
          {
            id: '4',
            question: "Who painted the Mona Lisa?",
            options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"],
            correctAnswer: 0,
            difficulty: 'medium'
          },
          {
            id: '5',
            question: "What is the chemical symbol for gold?",
            options: ["Au", "Ag", "Fe", "Gd"],
            correctAnswer: 0,
            difficulty: 'medium'
          },
          {
            id: '6',
            question: "What is the rarest blood type?",
            options: ["O-", "AB-", "B-", "A-"],
            correctAnswer: 1,
            difficulty: 'hard'
          },
          {
            id: '7',
            question: "What is the most abundant element in the Earth's atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
            correctAnswer: 1,
            difficulty: 'hard'
          }
        ];
        
        const hardcodedAlternates = [
          {
            id: '8',
            question: "What is the capital of Japan?",
            options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
            correctAnswer: 2,
            difficulty: 'easy'
          },
          {
            id: '9',
            question: "Which element has the chemical symbol 'Na'?",
            options: ["Nitrogen", "Sodium", "Neon", "Nickel"],
            correctAnswer: 1,
            difficulty: 'medium'
          },
          {
            id: '10',
            question: "Who discovered penicillin?",
            options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Joseph Lister"],
            correctAnswer: 1,
            difficulty: 'hard'
          }
        ];
        
        setQuestions(hardcodedQuestions);
        setAlternateQuestions(hardcodedAlternates);
      }
    } finally {
      setLoading(false);
    }
  };

  // Define all available lifelines
  const defineLifelines = () => [
    {
      id: 'fifty-fifty',
      name: '50:50',
      description: 'Removes two incorrect options, leaving you with two choices including the correct answer.',
      icon: '50/50',
      used: false,
      handler: useFiftyFifty
    },
    {
      id: 'skip',
      name: 'Skip',
      description: 'Skip the current question and move to the next one without penalty.',
      icon: 'SKIP',
      used: false,
      handler: useSkip
    },
    {
      id: 'change',
      name: 'Change',
      description: 'Replace the current question with a different one of the same difficulty.',
      icon: 'CHG',
      used: false,
      handler: useChange
    },
    {
      id: 'pause',
      name: 'Pause',
      description: 'Pause the timer for 30 seconds to give you more time to think.',
      icon: 'PAUSE',
      used: false,
      handler: usePause
    },
    {
      id: 'double',
      name: 'Double Chance',
      description: 'Get a second attempt if you answer incorrectly.',
      icon: '2X',
      used: false,
      handler: useDouble
    }
  ];

  // Initialize available lifelines
  useEffect(() => {
    setAvailableLifelines(defineLifelines());
  }, []);

  // Lifeline handlers
  const useFiftyFifty = (questionIndex) => {
    if (!questions[questionIndex]) return false;
    
    // Create a copy of the current questions array
    const updatedQuestions = [...questions];
    const currentQ = updatedQuestions[questionIndex];
    
    // Get all wrong answer indices
    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter(idx => idx !== currentQ.correctAnswer);
    
    // Shuffle wrong indices and keep only one (removing two incorrect options)
    for (let i = wrongIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
    }
    
    // Keep only one wrong answer (the first in our shuffled array)
    const keepWrongIndex = wrongIndices[0];
    
    // Create a new options array with only the correct answer and one wrong answer
    // Mark removed options with null so the UI can handle them appropriately
    currentQ.options = currentQ.options.map((option, idx) => {
      if (idx === currentQ.correctAnswer || idx === keepWrongIndex) {
        return option;
      } else {
        return null; // Mark as removed
      }
    });
    
    // Update the questions array
    setQuestions(updatedQuestions);
    
    // Mark lifeline as used
    updateLifelineStatus('fifty-fifty');
    
    return true;
  };
  
  const useSkip = (questionIndex) => {
    if (questionIndex >= questions.length - 1) return false;
    
    // Simply move to the next question
    setCurrentQuestion(questionIndex + 1);
    
    // Mark lifeline as used
    updateLifelineStatus('skip');
    
    return true;
  };
  
  const useChange = (questionIndex) => {
    if (!questions[questionIndex] || alternateQuestions.length === 0) return false;
    
    // Get the difficulty of the current question
    const currentDifficulty = questions[questionIndex].difficulty;
    
    // Find an alternate question with the same difficulty
    const alternateIndex = alternateQuestions.findIndex(q => q.difficulty === currentDifficulty);
    
    if (alternateIndex === -1) return false;
    
    // Get the alternate question
    const alternateQuestion = alternateQuestions[alternateIndex];
    
    // Remove it from alternates
    const newAlternates = [...alternateQuestions];
    newAlternates.splice(alternateIndex, 1);
    setAlternateQuestions(newAlternates);
    
    // Replace current question
    const newQuestions = [...questions];
    newQuestions[questionIndex] = alternateQuestion;
    setQuestions(newQuestions);
    
    // Mark lifeline as used
    updateLifelineStatus('change');
    
    return true;
  };
  
  const usePause = () => {
    // The pause functionality will be implemented in the game component
    // by pausing the timer for 30 seconds
    
    // Mark lifeline as used
    updateLifelineStatus('pause');
    
    return true;
  };
  
  const useDouble = () => {
    // Double chance is managed in the game component
    // when checking the answer, allowing a second attempt
    
    // Mark lifeline as used
    updateLifelineStatus('double');
    
    return true;
  };
  
  // Update a lifeline's used status
  const updateLifelineStatus = (lifelineId, isUsed = true) => {
    setSelectedLifelines(prev => 
      prev.map(lifeline => 
        lifeline.id === lifelineId 
        ? { ...lifeline, used: isUsed } 
        : lifeline
      )
    );
  };
  
  // Select lifelines before starting the game
  const selectLifelines = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;
    
    const selected = availableLifelines
      .filter(lifeline => selectedIds.includes(lifeline.id))
      .map(lifeline => ({ ...lifeline, used: false }));
    
    setSelectedLifelines(selected);
  };

  // Game navigation functions
  const startGame = () => {
    // Check if lifelines are selected
    if (selectedLifelines.length === 0) {
      // If no lifelines are selected, show lifeline selection screen
      setGameScreen('lifelines');
      return;
    }
    
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
    setGameInProgress(true);
    setGameScreen('game');
    loadQuestions();
    
    // Reset lifelines usage status
    setSelectedLifelines(prev => 
      prev.map(lifeline => ({ ...lifeline, used: false }))
    );
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
      loading,
      
      // Lifelines
      availableLifelines,
      selectedLifelines,
      selectLifelines,
      useFiftyFifty,
      useSkip,
      useChange,
      usePause,
      useDouble,
      updateLifelineStatus,
      
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
