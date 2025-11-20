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
  const [timeLeft, setTimeLeft] = useState(20); // Uniform 20 seconds for all questions
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [currentPrize, setCurrentPrize] = useState(0);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [totalAnswerTime, setTotalAnswerTime] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Prize structure for 16 questions
  const prizeStructure = [
    1000, 2000, 3000, // Easy (Q1-Q3)
    5000, 10000, 20000, 50000, 100000, 200000, // Medium (Q4-Q9)
    500000, 1000000, 2000000, 5000000, 10000000, 50000000, 700000000 // Hard (Q10-Q16)
  ];

  // Initialize audio reference
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Time limits based on question number
  const getTimeLimit = (questionNum) => {
    if (questionNum <= 3) return 10;
    if (questionNum <= 9) return 20;
    return 30;
  };
  
  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        // Fetch 16 random questions without level restrictions
        const questionData = await QuizTimeAPI.getRandomQuestions(userData.user?.username || 'anonymous', 16);
        
        setUser(userData.user);
        
        // Convert backend format to game format with uniform timing
        const gameQuestions = questionData.map((q, index) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.options.indexOf(q.answer), // Convert answer to index
          id: q.id,
          timeLimit: 20, // Uniform 20 seconds for all questions
          prizeValue: prizeStructure[index] || 1000,
          questionNumber: index + 1
        }));
        
        setQuestions(gameQuestions);
        setLoadError(null);
        
        // Set uniform timer for all questions
        setTimeLeft(20);
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
  
  // Update timer when question changes - uniform 20 seconds
  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length && screen === 'inGame') {
      setTimeLeft(20); // Uniform 20 seconds for all questions
    }
  }, [currentQuestion, questions, screen]);


  
  // Show loading state while questions are being fetched
  if (isLoadingQuestions) {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
            <p className="text-lg opacity-80">Preparing your questions...</p>
          </div>
        </div>
      </>
    );
  }
  
  // Show error state if questions failed to load
  if (loadError) {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Failed to Load Game</h2>
            <p className="text-lg opacity-80 mb-6">{loadError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/menu')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </>
    );
  }
  
  // Return early if no questions loaded
  if (questions.length === 0) {
    return (
      <>
        <style jsx>{styles}</style>
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
      </>
    );
  }
  
  const currentQuestionData = questions[currentQuestion];

  // Format prize with commas
  const formatPrize = (amount) => {
    return '$' + amount.toLocaleString();
  };
  
  // Save game results to backend
  const saveGameResults = async (gameCompleted) => {
    try {
      // Calculate completion time as sum of all answer times
      let finalAnswerTime = totalAnswerTime;
      if (questionStartTime) {
        finalAnswerTime += Math.round((new Date() - questionStartTime) / 1000);
      }
      const completionTime = finalAnswerTime || (gameStartTime ? 
        Math.round((new Date() - gameStartTime) / 1000) : 0);
      
      const wrongAnswers = (currentQuestion + 1) - correctAnswersCount;
      const averageTimePerQuestion = completionTime > 0 ? completionTime / (currentQuestion + 1) : 0;
      
      // Calculate lifelines used
      const allLifelines = ['50:50', 'Ask Audience', 'Phone Friend', 'Pause Timer', 'Skip', 'Change Question'];
      const lifelinesUsedCount = {};
      allLifelines.forEach(lifeline => {
        lifelinesUsedCount[lifeline.replace(/[^a-zA-Z]/g, '')] = usedLifelines.filter(ul => ul === lifeline).length;
      });
      
      const gameStats = {
        score: currentPrize,
        questionsAnswered: currentQuestion + 1,
        correctAnswers: correctAnswersCount,
        wrongAnswers: wrongAnswers,
        averageTimePerQuestion: averageTimePerQuestion,
        averageCompletionTime: `${Math.floor(completionTime / 60)}:${(completionTime % 60).toString().padStart(2, '0')}`,
        totalTime: completionTime,
        level: 'normal',
        lifelinesUsed: lifelinesUsedCount,
        gameCompleted,
        gamesCompleted: gameCompleted ? 1 : 0,
        totalPrizeMoney: currentPrize,
        totalEarnings: currentPrize,
        gamesPlayed: 1,
        gamesWon: gameCompleted ? 1 : 0,
        accuracy: correctAnswersCount > 0 ? Math.round((correctAnswersCount / (currentQuestion + 1)) * 100) : 0
      };
      
        // Get current user profile to get username
        const profile = await QuizTimeAPI.getUserProfile();
        if (profile?.username) {
          // Add username to gameStats for API calls
          const gameStatsWithUser = {
            ...gameStats,
            username: profile.username
          };
          
          // Save stats
          await QuizTimeAPI.saveStats(profile.username, gameStatsWithUser);
          console.log('Game stats saved successfully');
          
          // Save to leaderboard with backend parameter names
          try {
            const leaderboardEntry = {
              userId: profile.userId || profile.username, // Use userId if available, fallback to username
              playerName: profile.username,
              username: profile.username, // Add username field too
              prizeWon: currentPrize,
              questionsAnswered: currentQuestion + 1,
              totalQuestions: questions.length,
              completionDate: new Date().toISOString(),
              completionTime: completionTime / 60 // Convert seconds to minutes (decimal)
            };          const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(leaderboardEntry)
          });
          
          if (response.ok) {
            console.log('Leaderboard entry saved successfully');
          }
        } catch (apiError) {
          console.error('Failed to save leaderboard entry:', apiError);
        }
        
        // Also save stats to stats API
        try {
          const response = await fetch('/api/stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: profile.username,
              ...gameStats
            })
          });
          
          if (response.ok) {
            console.log('Game stats saved to database successfully');
          }
        } catch (apiError) {
          console.error('Failed to save stats to database via API:', apiError);
        }
      }
    } catch (error) {
      console.error('Failed to save game results:', error);
    }
  };
  
  // Handle time up
  const handleTimeUp = () => {
    if (locked) return;
    setLocked(true);
    setResult('wrong');
    setTimeout(() => {
      saveGameResults(false); // Game failed due to timeout
      setScreen('gameOver');
    }, 1000);
  };



  // Lifeline selection
  const toggleLifeline = (lifeline) => {
    if (selectedLifelines.includes(lifeline)) {
      setSelectedLifelines(selectedLifelines.filter(l => l !== lifeline));
    } else if (selectedLifelines.length < 2) {
      setSelectedLifelines([...selectedLifelines, lifeline]);
    }
  };

  // Start game
  const startGame = () => {
    setScreen('inGame');
    setCurrentQuestion(0);
    setCurrentPrize(0);
    setTimeLeft(questions.length > 0 ? questions[0].timeLimit : 10);
    setSelectedAnswer(null);
    setLocked(false);
    setResult(null);
    setUsedLifelines([]);
    setHiddenOptions([]);
    setIsPaused(false);
    setGameStartTime(new Date());
    setQuestionStartTime(new Date()); // Start timing first question
    setTotalAnswerTime(0); // Reset total answer time
    setCorrectAnswersCount(0);
  };



  // Use lifeline
  const useLifeline = (lifeline) => {
    if (usedLifelines.includes(lifeline) || !selectedLifelines.includes(lifeline)) return;

    playSound('click');
    setUsedLifelines([...usedLifelines, lifeline]);

    if (lifeline === '50-50') {
      // Remove 2 wrong answers
      const correctIdx = currentQuestionData.correctAnswer;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      const toHide = [];
      for (let i = 0; i < 2 && wrongIndices.length > 0; i++) {
        const randomIdx = Math.floor(Math.random() * wrongIndices.length);
        toHide.push(wrongIndices[randomIdx]);
        wrongIndices.splice(randomIdx, 1);
      }
      setHiddenOptions(toHide);
    } else if (lifeline === 'Pause Timer') {
      // Toggle pause state (don't mark as used until timer resumes)
      setIsPaused(!isPaused);
      // Remove from used lifelines since pause timer can be toggled
      setUsedLifelines(usedLifelines.filter(ul => ul !== 'Pause Timer'));
    } else if (lifeline === 'Skip') {
      // Skip to next question, deduct prize money
      const skippedPrize = prizeStructure[currentQuestion];
      const newPrize = Math.max(0, currentPrize - skippedPrize);
      setCurrentPrize(newPrize);
      moveToNextQuestion(true);
    } else if (lifeline === 'Change Question') {
      // Change to a new question - create a random alternative question
      const currentQ = currentQuestionData;
      const alternativeQuestions = [
        {
          question: "What is the largest ocean on Earth?",
          options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
          correctAnswer: 3
        },
        {
          question: "Which gas makes up most of Earth's atmosphere?",
          options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
          correctAnswer: 1
        },
        {
          question: "What is the hardest natural substance on Earth?",
          options: ["Gold", "Iron", "Diamond", "Silver"],
          correctAnswer: 2
        },
        {
          question: "Which planet is closest to the Sun?",
          options: ["Venus", "Earth", "Mercury", "Mars"],
          correctAnswer: 2
        },
        {
          question: "What is the capital of Australia?",
          options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
          correctAnswer: 3
        }
      ];
      
      // Select a random alternative question
      const randomQuestion = alternativeQuestions[Math.floor(Math.random() * alternativeQuestions.length)];
      
      // Replace current question with the new one
      const newQuestions = [...questions];
      newQuestions[currentQuestion] = randomQuestion;
      setQuestions(newQuestions);
      
      // Reset question state
      setSelectedAnswer(null);
      setLocked(false);
      setResult(null);
      setHiddenOptions([]);
      setTimeLeft(getTimeLimit(currentQuestion + 1));
      setIsPaused(false);
    } else if (lifeline === 'Double Chance') {
      // This will be handled in answer checking
    }
  };

  // Handle answer click (single click to select and confirm)
  const handleAnswerClick = (index) => {
    if (locked || hiddenOptions.includes(index)) return;
    
    // Track time taken for this answer
    if (questionStartTime) {
      const answerTime = Math.round((new Date() - questionStartTime) / 1000);
      setTotalAnswerTime(prev => prev + answerTime);
      setQuestionStartTime(null);
    }
    
    playSound('click');
    setSelectedAnswer(index);
    setLocked(true);
    clearTimeout(timerRef.current);

    const correct = index === currentQuestionData.correctAnswer;
    
    if (correct) {
      setResult('correct');
      playSound('correct');
      setCurrentPrize(prizeStructure[currentQuestion]);
      
      setTimeout(() => {
        moveToNextQuestion(false);
      }, 2000);
    } else {
      // Check if double chance is available and not used
      const hasDoubleChance = selectedLifelines.includes('Double Chance') && 
                             !usedLifelines.includes('Double Chance');
      
      if (hasDoubleChance) {
        setResult('wrong');
        playSound('wrong');
        setUsedLifelines([...usedLifelines, 'Double Chance']);
        
        setTimeout(() => {
          setResult(null);
          setSelectedAnswer(null);
          setLocked(false);
          setTimeLeft(getTimeLimit(currentQuestion + 1));
        }, 2000);
      } else {
        setResult('wrong');
        playSound('wrong');
        saveGameResults(false); // Game ended due to wrong answer
        setTimeout(() => {
          setScreen('gameOver');
        }, 2000);
      }
    }
  };

  // Move to next question
  const moveToNextQuestion = (skipped) => {
    if (currentQuestion >= 14) {
      // Won the game!
      saveGameResults(true); // Game completed successfully
      setScreen('victory');
      return;
    }

    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    setTimeLeft(questions[nextQuestion]?.timeLimit || getTimeLimit(nextQuestion + 1));
    setSelectedAnswer(null);
    setLocked(false);
    setResult(null);
    setHiddenOptions([]);
    setIsPaused(false);
    setQuestionStartTime(new Date()); // Track when question starts
  };

  // Restart game
  const restartGame = () => {
    setScreen('lifelineSelect');
    setSelectedLifelines([]);
    setUsedLifelines([]);
    setCurrentQuestion(0);
    setCurrentPrize(0);
    setTimeLeft(20);
    setSelectedAnswer(null);
    setLocked(false);
    setResult(null);
    setHiddenOptions([]);
    setIsPaused(false);
  };

  // Quit game
  const quitGame = () => {
    if (confirm('Are you sure you want to quit?')) {
      router.push('/menu');
    }
  };

  // Get option style
  const getOptionStyle = (index) => {
    if (hiddenOptions.includes(index)) {
      return {
        opacity: 0.3,
        pointerEvents: 'none'
      };
    }
    
    let baseStyle = {
      padding: '15px 20px',
      margin: '10px 0',
      backgroundColor: selectedAnswer === index ? 'rgba(220, 220, 220, 0.9)' : 'rgba(240, 240, 240, 0.8)',
      color: '#333',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      backdropFilter: 'blur(5px)',
      border: selectedAnswer === index ? '2px solid rgba(74, 144, 226, 0.6)' : '1px solid rgba(200, 200, 200, 0.5)'
    };
    
    if (locked) {
      if (result === 'correct' && index === questions[currentQuestion].correctAnswer) {
        baseStyle.backgroundColor = 'rgba(34, 197, 94, 0.6)';
        baseStyle.color = '#fff';
        baseStyle.border = '2px solid #22C55E';
      } else if (result === 'wrong' && index === selectedAnswer) {
        baseStyle.backgroundColor = 'rgba(239, 68, 68, 0.6)';
        baseStyle.color = '#fff';
        baseStyle.border = '2px solid #EF4444';
      } else if (index === questions[currentQuestion].correctAnswer && result === 'wrong') {
        baseStyle.backgroundColor = 'rgba(34, 197, 94, 0.6)';
        baseStyle.color = '#fff';
        baseStyle.border = '2px solid #22C55E';
      }
    }
    
    return baseStyle;
  };

  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: 'url(/assets/images/background.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 0, 130, 0.7)', // Purple overlay
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  // RENDER: Lifeline Selection Screen
  if (screen === 'lifelineSelect') {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'transparent',
              padding: '60px 40px',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h1 style={{
                fontSize: '4rem',
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                QuizTime
              </h1>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#FFD700',
                marginBottom: '40px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
              }}>
                Select Any 2 Lifelines Before You Start
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '40px'
              }}>
                {[
                  { name: '50-50', desc: 'Remove 2 wrong options' },
                  { name: 'Pause Timer', desc: 'Stop the countdown' },
                  { name: 'Skip', desc: 'Skip this question' },
                  { name: 'Change Question', desc: 'Get new question' },
                  { name: 'Double Chance', desc: 'Two attempts' }
                ].map(lifeline => (
                  <button
                    key={lifeline.name}
                    onClick={() => toggleLifeline(lifeline.name)}
                    style={{
                      padding: '15px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      backgroundColor: selectedLifelines.includes(lifeline.name) ? 
                        'rgba(255, 215, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                      color: selectedLifelines.includes(lifeline.name) ? '#000' : '#FFD700',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      border: selectedLifelines.includes(lifeline.name) ? 
                        '2px solid #FFD700' : '2px solid rgba(255, 215, 0, 0.4)',
                      backdropFilter: 'blur(5px)',
                      boxShadow: selectedLifelines.includes(lifeline.name) ? 
                        '0 4px 12px rgba(255, 215, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div>{lifeline.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>{lifeline.desc}</div>
                  </button>
                ))}
              </div>
              
              {selectedLifelines.length === 2 && (
                <button
                  onClick={() => {
                    playSound('click');
                    startGame();
                  }}
                  style={{
                    padding: '18px 60px',
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  Start Game
                </button>
              )}
              
              {selectedLifelines.length < 2 && (
                <p style={{ color: '#FFD700', fontSize: '1.1rem' }}>
                  Please select exactly 2 lifelines to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: In-Game Screen
  if (screen === 'inGame') {
    
    // Mobile Layout
    if (isMobile) {
      return (
        <div style={containerStyle}>
          <style>{styles}</style>
          <div style={overlayStyle}></div>
          <div style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '0'
          }}>
            {/* Mobile Top Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '12px 16px',
              borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{ 
                  color: '#FFD700', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  lineHeight: '1.2'
                }}>
                  Q{currentQuestion + 1}/15
                </div>
                <div style={{ 
                  color: '#FFD700', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  lineHeight: '1.2'
                }}>
                  {formatPrize(currentPrize)}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ 
                  color: timeLeft <= 5 ? '#FF4444' : '#FFD700', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {timeLeft}s
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    quitGame();
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Quit
                </button>
              </div>
            </div>

            {/* Mobile Main Content - Questions */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  lineHeight: '1.4'
                }}>
                  {questions[currentQuestion].question}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerClick(index)}
                      style={{
                        ...getOptionStyle(index),
                        fontSize: '1rem',
                        padding: '14px 16px',
                        textAlign: 'left',
                        borderRadius: '12px',
                        minHeight: '50px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </div>
                  ))}
                </div>
                
                {/* Answer Feedback - Mobile */}
                {locked && result && (
                  <div style={{
                    marginTop: '50px',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    {result === 'correct' ? (
                      <div style={{ color: '#22C55E' }}>Correct Answer!</div>
                    ) : (
                      <div style={{ color: '#EF4444' }}>Incorrect Answer!</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Bottom Bar - Lifelines */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              borderTop: '2px solid rgba(255, 215, 0, 0.3)',
              padding: '8px'
            }}>
              <div className="mobile-lifelines">
                {[
                  '50-50',
                  'Pause Timer',
                  'Skip', 
                  'Change Question',
                  'Double Chance'
                ].map(lifeline => {
                  const isActive = selectedLifelines.includes(lifeline);
                  const isUsed = usedLifelines.includes(lifeline);
                  const canUse = isActive && !isUsed;
                  
                  return (
                    <button
                      key={lifeline}
                      onClick={() => canUse ? useLifeline(lifeline) : null}
                      className="mobile-lifeline-btn"
                      style={{
                        backgroundColor: canUse ? 'rgba(255, 215, 0, 0.3)' : 
                                       isUsed ? 'rgba(100, 100, 100, 0.2)' : 
                                       'rgba(60, 60, 60, 0.4)',
                        color: canUse ? '#FFD700' : 
                               isUsed ? '#888' : '#666',
                        border: canUse ? '1px solid rgba(255, 215, 0, 0.6)' : 
                               '1px solid rgba(100, 100, 100, 0.3)',
                        borderRadius: '8px',
                        cursor: canUse ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(5px)',
                        opacity: isActive ? 1 : 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        lineHeight: '1.1'
                      }}
                      disabled={!canUse}
                    >
                      {lifeline}
                      {isUsed && <div style={{ fontSize: '0.5rem', color: '#FF4444', marginTop: '2px' }}>Used</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Desktop Layout (Original)
    return (
      <div style={containerStyle}>
        <style>{styles}</style>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          {/* Desktop Top Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'transparent',
            padding: '20px',
            borderRadius: '15px',
            margin: '10px'
          }}>
            <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Question {currentQuestion + 1}/15
            </div>
            <div style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 'bold' }}>
              {formatPrize(currentPrize)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                color: timeLeft <= 5 ? '#FF4444' : '#FFD700', 
                fontSize: '1.5rem', 
                fontWeight: 'bold' 
              }}>
                Time Left: {timeLeft}s
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  quitGame();
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FFD700',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Quit
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, gap: '20px', padding: '0 10px' }}>
            {/* Left Panel */}
            <div style={{
              width: '220px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '6px',
              display: 'flex',
              height: '470px',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <h3 style={{ 
                color: '#FFD700', 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: '3px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
              }}>
                Lifelines
              </h3>
              {[
                '50-50',
                'Pause Timer', 
                'Skip',
                'Change Question',
                'Double Chance'
              ].map(lifeline => {
                const isActive = selectedLifelines.includes(lifeline);
                const isUsed = usedLifelines.includes(lifeline);
                const canUse = isActive && !isUsed;
                
                return (
                  <button
                    key={lifeline}
                    onClick={() => canUse ? useLifeline(lifeline) : null}
                    style={{
                      padding: '6px 4px',
                      backgroundColor: canUse ? 'rgba(255, 215, 0, 0.2)' : 
                                     isUsed ? 'rgba(100, 100, 100, 0.2)' : 
                                     'rgba(60, 60, 60, 0.4)',
                      color: canUse ? '#FFD700' : 
                             isUsed ? '#888' : '#666',
                      borderRadius: '8px',
                      cursor: canUse ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      transition: 'all 0.3s ease',
                      border: canUse ? '1px solid rgba(255, 215, 0, 0.6)' : 
                             isUsed ? '1px solid #666' : 
                             '1px solid rgba(100, 100, 100, 0.3)',
                      backdropFilter: 'blur(5px)',
                      opacity: isActive ? 1 : 0.5
                    }}
                    disabled={!canUse}
                  >
                    {lifeline}
                    {lifeline === 'Pause Timer' && isPaused && canUse ? ' (Active)' : ''}
                    {!isActive ? ' (Inactive)' : isUsed ? ' (Used)' : ''}
                  </button>
                );
              })}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                backgroundColor: 'transparent',
                padding: '30px',
                borderRadius: '20px',
                textAlign: 'center',
                marginBottom: '30px',
                width: '100%',
                maxWidth: '800px'
              }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}>
                  {questions[currentQuestion].question}
                </h2>
                
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerClick(index)}
                      style={getOptionStyle(index)}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
                
                {/* Answer Feedback - Desktop */}
                {locked && result && (
                  <div style={{
                    marginTop: '50px',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                  }}>
                    {result === 'correct' ? (
                      <div style={{ color: '#22C55E' }}>Correct Answer!</div>
                    ) : (
                      <div style={{ color: '#EF4444' }}>Incorrect Answer!</div>
                    )}
                  </div>
                )}
                
                <p style={{ 
                  color: '#FFD700', 
                  marginTop: '20px', 
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}>
                  Click your answer to lock it in!
                </p>
              </div>
            </div>

            {/* Right Panel - Prize Ladder */}
            <div style={{
              width: '220px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '500px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="hide-scrollbar">
              <h3 style={{ 
                color: '#FFD700', 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: '10px',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
              }}>
                Prize Ladder
              </h3>
              {prizeStructure.map((prize, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: index === currentQuestion ? 'rgba(255, 215, 0, 0.3)' : 
                                   index < currentQuestion ? 'rgba(34, 197, 94, 0.2)' : 
                                   'rgba(255, 255, 255, 0.1)',
                    color: index === currentQuestion ? '#000' : 
                           index < currentQuestion ? '#22C55E' : '#FFD700',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: index === currentQuestion ? 'bold' : 'normal',
                    textAlign: 'center'
                  }}
                >
                  Q{15 - index}: {formatPrize(prize)}
                </div>
              )).reverse()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Game Over Screen
  if (screen === 'gameOver') {
    return (
      <div style={containerStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              padding: '60px 40px',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '100%',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <h1 style={{
                fontSize: '4rem',
                color: '#FF4444',
                textShadow: '0 0 40px rgba(255, 68, 68, 0.8)',
                marginBottom: '30px',
                fontWeight: 'bold'
              }}>
                GAME OVER
              </h1>
              <p style={{
                fontSize: '2rem',
                color: '#FFD700',
                fontWeight: 'bold',
                marginBottom: '40px'
              }}>
                You won: {formatPrize(currentPrize)}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <button
                  onClick={restartGame}
                  style={{
                    padding: '18px 50px',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    minWidth: '250px'
                  }}
                >
                  Restart Game
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  style={{
                    padding: '18px 50px',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    backgroundColor: '#EF4444',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    minWidth: '250px'
                  }}
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Victory Screen
  if (screen === 'victory') {
    return (
      <div style={containerStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              padding: '60px 40px',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '100%',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <h1 style={{
                fontSize: '3.5rem',
                color: '#FFD700',
                textShadow: '0 0 40px rgba(255, 215, 0, 1)',
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                CONGRATULATIONS!
              </h1>
              <h2 style={{
                fontSize: '2rem',
                color: '#FFD700',
                marginBottom: '15px'
              }}>
                You Won
              </h2>
              <p style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: '#FFD700',
                textShadow: '0 0 50px rgba(255, 215, 0, 1)',
                marginBottom: '40px'
              }}>
                $700,000,000! 🎉
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <button
                  onClick={restartGame}
                  style={{
                    padding: '18px 50px',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    minWidth: '250px'
                  }}
                >
                  Play Again
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  style={{
                    padding: '18px 50px',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    backgroundColor: '#EF4444',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    minWidth: '250px'
                  }}
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Game;
