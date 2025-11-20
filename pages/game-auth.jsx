import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '../src/context/app-context';
import QuizTimeAPI from '../src/services/api';

// Add CSS for hiding scrollbar and mobile styles
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .mobile-lifelines {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 8px;
    gap: 4px;
  }
  .mobile-lifeline-btn {
    flex: 1;
    min-width: 50px;
    font-size: 0.7rem;
    padding: 6px 2px;
    text-align: center;
  }
  @media (max-width: 768px) {
    .desktop-only {
      display: none !important;
    }
    .mobile-only {
      display: block !important;
    }
  }
  @media (min-width: 769px) {
    .desktop-only {
      display: block !important;
    }
    .mobile-only {
      display: none !important;
    }
  }
`;

const Game = () => {
  const router = useRouter();
  const { playSound } = useApp();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Authentication and question loading
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameStructure, setGameStructure] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Game states
  const [screen, setScreen] = useState('lifelineSelect'); // lifelineSelect | inGame | gameOver | victory
  const [selectedLifelines, setSelectedLifelines] = useState([]);
  const [usedLifelines, setUsedLifelines] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // Initial time for first question (easy)
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [currentPrize, setCurrentPrize] = useState(0);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Initialize audio reference
  const audioRef = useRef(null);

  // Authentication check and question loading
  useEffect(() => {
    // Check authentication
    if (!QuizTimeAPI.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Load questions from backend
    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const userData = await QuizTimeAPI.getUserProfile();
        const questionData = await QuizTimeAPI.getGameQuestions(userData.user?.username || 'anonymous');
        
        setUser(userData.user);
        setQuestions(questionData.questions);
        setGameStructure(questionData.gameStructure);
        setLoadError(null);
        
        // Set initial timer based on first question
        if (questionData.questions.length > 0) {
          setTimeLeft(questionData.questions[0].timeLimit || 10);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoadError('Failed to load game questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    loadQuestions();
    
    // Update body styles when mounting/unmounting
    const originalBodyClass = document.body.className;
    const originalBodyStyle = document.body.style.cssText;
    
    document.body.className = '';
    document.body.style.cssText = `
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    `;
    
    return () => {
      document.body.className = originalBodyClass;
      document.body.style.cssText = originalBodyStyle;
    };
  }, [router]);

  // Timer effect with dynamic time limits based on question level
  useEffect(() => {
    if (screen !== 'inGame' || locked || isPaused || questions.length === 0) return;
    
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, screen, locked, isPaused, questions]);
  
  // Update timer when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length && screen === 'inGame') {
      const questionData = questions[currentQuestion];
      setTimeLeft(questionData.timeLimit || 30);
    }
  }, [currentQuestion, questions, screen]);

  // Show loading state while questions are being fetched
  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
          <p className="text-lg opacity-80">Preparing your questions...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if questions failed to load
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Failed to Load Game</h2>
          <p className="text-lg opacity-80 mb-6">{loadError}</p>
          <button 
            onClick={() => router.push('/menu')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }
  
  // Return early if no questions loaded
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <button 
            onClick={() => router.push('/menu')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  
  const availableLifelines = [
    { id: 'fifty-fifty', name: '50:50' },
    { id: 'skip', name: 'Skip' },
    { id: 'audience-poll', name: 'Audience Poll' },
    { id: 'hint', name: 'Hint' },
    { id: 'change-question', name: 'Change Question' }
  ];

  const handleTimeUp = () => {
    if (locked) return;
    setLocked(true);
    setResult('wrong');
    setTimeout(() => {
      saveGameResults(false); // Game failed due to timeout
      setScreen('gameOver');
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (locked || result) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerLock = () => {
    if (selectedAnswer === null || locked) return;
    
    setLocked(true);
    
    const isCorrect = selectedAnswer === currentQuestionData.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setCurrentPrize(currentQuestionData.prizeValue || 0);
      setCorrectAnswersCount(prev => prev + 1);
      
      setTimeout(() => {
        if (currentQuestion >= questions.length - 1) {
          saveGameResults(true); // Game completed
          setScreen('victory');
        } else {
          nextQuestion();
        }
      }, 2000);
    } else {
      setTimeout(() => {
        saveGameResults(false); // Game failed
        setScreen('gameOver');
      }, 2000);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setLocked(false);
    setResult(null);
    setHiddenOptions([]);
  };

  const saveGameResults = async (gameCompleted) => {
    try {
      const completionTime = gameStartTime ? 
        Math.round((new Date() - gameStartTime) / 1000) : 0;
      
      const gameResult = {
        questionsAnswered: currentQuestion + 1,
        correctAnswers: correctAnswersCount,
        totalQuestions: questions.length,
        finalPrize: currentPrize,
        completionTime: `${Math.floor(completionTime / 60)}:${(completionTime % 60).toString().padStart(2, '0')}`,
        gameCompleted
      };
      
      await QuizTimeAPI.saveGameResult(gameResult);
      console.log('Game results saved successfully');
    } catch (error) {
      console.error('Failed to save game results:', error);
    }
  };

  const useLifeline = (lifelineId) => {
    if (usedLifelines.includes(lifelineId) || locked) return;
    
    setUsedLifelines(prev => [...prev, lifelineId]);
    
    switch (lifelineId) {
      case 'fifty-fifty':
        const correctAnswer = currentQuestionData.answer;
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const toHide = wrongAnswers.slice(0, 2);
        setHiddenOptions(toHide);
        break;
        
      case 'skip':
        if (currentQuestion >= questions.length - 1) {
          setScreen('victory');
        } else {
          nextQuestion();
        }
        break;
        
      case 'audience-poll':
        // Show audience poll modal (simplified)
        alert(`Audience Poll: 
Option A: 25%
Option B: 15%  
Option C: 45%
Option D: 15%`);
        break;
        
      case 'hint':
        // Show hint for current question (simplified)
        alert('Hint: Think carefully about the most logical answer based on common knowledge.');
        break;
        
      case 'change-question':
        const availableQuestions = questions.filter((_, index) => index !== currentQuestion);
        if (availableQuestions.length > 0) {
          const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
          const newQuestionIndex = questions.findIndex(q => q.id === randomQuestion.id);
          setCurrentQuestion(newQuestionIndex);
          setSelectedAnswer(null);
          setResult(null);
          setHiddenOptions([]);
          // Timer will be updated by useEffect
        }
        break;
    }
  };

  const startGame = () => {
    setScreen('inGame');
    setCurrentQuestion(0);
    setCurrentPrize(0);
    setUsedLifelines([]);
    setSelectedAnswer(null);
    setLocked(false);
    setResult(null);
    setHiddenOptions([]);
    setIsPaused(false);
    setGameStartTime(new Date());
    setCorrectAnswersCount(0);
  };

  // Lifeline Selection Screen
  if (screen === 'lifelineSelect') {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Select Your Lifelines</h1>
              <p className="text-xl text-white opacity-80">Choose 3 lifelines to help you win up to $700,000,000!</p>
              {gameStructure && (
                <div className="mt-4 text-white opacity-90">
                  <p className="text-lg">Game Structure (16 Questions Total):</p>
                  <p className="text-sm">Q1-Q3: Easy ({gameStructure.easy.timeLimit}s each) • Q4-Q9: Medium ({gameStructure.medium.timeLimit}s each) • Q10-Q16: Hard ({gameStructure.hard.timeLimit}s each)</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {availableLifelines.map((lifeline) => (
                <button
                  key={lifeline.id}
                  onClick={() => {
                    if (selectedLifelines.includes(lifeline.id)) {
                      setSelectedLifelines(prev => prev.filter(id => id !== lifeline.id));
                    } else if (selectedLifelines.length < 3) {
                      setSelectedLifelines(prev => [...prev, lifeline.id]);
                    }
                  }}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                    selectedLifelines.includes(lifeline.id)
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">{lifeline.name}</h3>
                  <p className="text-sm opacity-80">
                    {lifeline.id === 'fifty-fifty' && 'Remove two incorrect answers'}
                    {lifeline.id === 'skip' && 'Skip to the next question'}
                    {lifeline.id === 'audience-poll' && 'See what the audience thinks'}
                    {lifeline.id === 'hint' && 'Get a helpful hint'}
                    {lifeline.id === 'change-question' && 'Change to a different question'}
                  </p>
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-white mb-4">
                Selected: {selectedLifelines.length}/3 lifelines
              </p>
              <button
                onClick={startGame}
                disabled={selectedLifelines.length !== 3}
                className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 ${
                  selectedLifelines.length === 3
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Game Screen
  if (screen === 'inGame') {
    return (
      <>
        <style jsx>{styles}</style>
        <audio ref={audioRef} preload="auto">
          <source src="/assets/sounds/correct.mp3" type="audio/mpeg" />
        </audio>
        
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
          {/* Mobile Layout */}
          <div className="mobile-only">
            {/* Top Bar - Question Info */}
            <div className="bg-black bg-opacity-50 p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">
                    Question {currentQuestionData.questionNumber || currentQuestion + 1}
                  </div>
                  <div className="text-sm opacity-75 capitalize">
                    {currentQuestionData.level} Level • {currentQuestionData.timeLimit}s
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${(currentQuestionData.prizeValue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-75">Prize Value</div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-4 flex-1">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
                <p className="text-white text-lg">{currentQuestionData.question}</p>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}
                </div>
                <div className="text-white opacity-75">seconds remaining</div>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestionData.options.map((option, index) => {
                  if (hiddenOptions.includes(index)) return null;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={locked}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                        selectedAnswer === index
                          ? result
                            ? index === currentQuestionData.answer
                              ? 'bg-green-600 border-green-400 text-white'
                              : 'bg-red-600 border-red-400 text-white'
                            : 'bg-blue-600 border-blue-400 text-white'
                          : result && index === currentQuestionData.answer
                          ? 'bg-green-600 border-green-400 text-white'
                          : 'bg-white bg-opacity-90 border-white border-opacity-50 text-gray-800 hover:bg-opacity-100'
                      }`}
                    >
                      <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Lock Answer Button */}
              {selectedAnswer !== null && !locked && (
                <div className="text-center mb-6">
                  <button
                    onClick={handleAnswerLock}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-lg"
                  >
                    Lock Answer
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Bar - Lifelines */}
            <div className="bg-black bg-opacity-50 mobile-lifelines">
              {availableLifelines.filter(l => selectedLifelines.includes(l.id)).map((lifeline) => (
                <button
                  key={lifeline.id}
                  onClick={() => useLifeline(lifeline.id)}
                  disabled={usedLifelines.includes(lifeline.id) || locked}
                  className={`mobile-lifeline-btn rounded-lg font-bold transition-all duration-300 ${
                    usedLifelines.includes(lifeline.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {lifeline.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="desktop-only flex flex-col h-screen">
            <div className="flex-1 flex">
              {/* Left Panel - Question */}
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white">
                      <span className="text-lg">Question {currentQuestionData.questionNumber || currentQuestion + 1}</span>
                      <div className="text-sm opacity-75 capitalize">
                        {currentQuestionData.level} Level • {currentQuestionData.timeLimit}s
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <div className="text-lg font-bold">
                        ${(currentQuestionData.prizeValue || 0).toLocaleString()}
                      </div>
                      <div className="text-sm opacity-75">Prize Value</div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-xl text-white">{currentQuestionData.question}</p>
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}
                  </div>
                  <div className="text-white opacity-75">seconds remaining</div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {currentQuestionData.options.map((option, index) => {
                    if (hiddenOptions.includes(index)) return null;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={locked}
                        className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                          selectedAnswer === index
                            ? result
                              ? index === currentQuestionData.answer
                                ? 'bg-green-600 border-green-400 text-white'
                                : 'bg-red-600 border-red-400 text-white'
                              : 'bg-blue-600 border-blue-400 text-white'
                            : result && index === currentQuestionData.answer
                            ? 'bg-green-600 border-green-400 text-white'
                            : 'bg-white bg-opacity-90 border-white border-opacity-50 text-gray-800 hover:bg-opacity-100'
                        }`}
                      >
                        <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Lock Answer Button */}
                {selectedAnswer !== null && !locked && (
                  <div className="text-center">
                    <button
                      onClick={handleAnswerLock}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-lg text-xl"
                    >
                      Lock Answer
                    </button>
                  </div>
                )}
              </div>

              {/* Right Panel - Lifelines */}
              <div className="w-64 bg-black bg-opacity-50 p-6">
                <h3 className="text-white text-xl font-bold mb-6">Lifelines</h3>
                <div className="space-y-4">
                  {availableLifelines.filter(l => selectedLifelines.includes(l.id)).map((lifeline) => (
                    <button
                      key={lifeline.id}
                      onClick={() => useLifeline(lifeline.id)}
                      disabled={usedLifelines.includes(lifeline.id) || locked}
                      className={`w-full p-4 rounded-lg font-bold transition-all duration-300 ${
                        usedLifelines.includes(lifeline.id)
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {lifeline.name}
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 text-white">
                  <h4 className="font-bold mb-2">Progress</h4>
                  <p className="text-sm opacity-75">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                  <p className="text-sm opacity-75">
                    Current Prize: ${currentPrize.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Game Over Screen
  if (screen === 'gameOver') {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="min-h-screen bg-gradient-to-b from-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
          <p className="text-xl mb-4">You won: ${currentPrize.toLocaleString()}</p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
            <p className="text-lg mb-2">Game Statistics:</p>
            <p className="text-sm opacity-90">Questions Answered: {currentQuestion + 1}/16</p>
            <p className="text-sm opacity-90">Correct Answers: {correctAnswersCount}</p>
            <p className="text-sm opacity-90">Accuracy: {currentQuestion >= 0 ? Math.round((correctAnswersCount / (currentQuestion + 1)) * 100) : 0}%</p>
          </div>
          <p className="text-lg opacity-80 mb-8">
            Failed on Question {currentQuestion + 1}: {currentQuestionData?.question}
          </p>
            <div className="space-y-4">
              <button
                onClick={() => setScreen('lifelineSelect')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push('/menu')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Victory Screen
  if (screen === 'victory') {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="min-h-screen bg-gradient-to-b from-green-900 to-purple-900 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-4">🎉 CONGRATULATIONS! 🎉</h1>
            <h2 className="text-6xl font-bold mb-4 text-yellow-400">
              $700,000,000
            </h2>
            <p className="text-xl mb-8">
              You've won the ultimate prize! You answered all 16 questions correctly!
            </p>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <p className="text-lg">Game Statistics:</p>
              <p className="text-sm opacity-90">Correct Answers: {correctAnswersCount}/{questions.length}</p>
              <p className="text-sm opacity-90">Final Prize: ${currentPrize.toLocaleString()}</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setScreen('lifelineSelect')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push('/menu')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default Game;