import React, { useState, useEffect } from 'react';
import Layout from './components/layout';
import Login from '../pages/login';
import Menu from '../pages/menu';
import Game from '../pages/game';
import Stats from '../pages/stats';
import Help from '../pages/help';
import Leaderboards from '../pages/leaderboard';
import LifelinesSelection from '../pages/lifelines-selection';

const Page = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    score: 0,
    timer: 0,
    gameOver: false,
    wonGame: false,
    questionHistory: []
  });

  useEffect(() => {
    // Check if user is logged in (can be expanded with more authentication logic)
    const savedUsername = localStorage.getItem('quiztime-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setCurrentScreen('menu');
    }
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    localStorage.setItem('quiztime-username', name);
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    localStorage.removeItem('quiztime-username');
    setUsername('');
    setCurrentScreen('login');
  };

  const handleStartGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      timer: 20, // Starting with 20 seconds for first questions
      gameOver: false,
      wonGame: false,
      questionHistory: []
    });
    // First navigate to lifelines selection screen
    setCurrentScreen('lifelines');
  };

  const handleGameOver = (finalState) => {
    setGameState(prevState => ({
      ...prevState,
      gameOver: true,
      ...finalState
    }));
    // Save stats to localStorage
    const stats = JSON.parse(localStorage.getItem('quiztime-stats') || '{}');
    const userStats = stats[username] || {
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: 0,
      highestLevel: 0,
      highestEarning: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    };
    
    userStats.gamesPlayed += 1;
    if (finalState.wonGame) {
      userStats.gamesWon += 1;
    }
    userStats.totalEarnings += finalState.score;
    userStats.highestLevel = Math.max(userStats.highestLevel, finalState.currentQuestion);
    userStats.highestEarning = Math.max(userStats.highestEarning, finalState.score);
    userStats.correctAnswers += finalState.currentQuestion;
    userStats.incorrectAnswers += finalState.gameOver && !finalState.wonGame ? 1 : 0;

    stats[username] = userStats;
    localStorage.setItem('quiztime-stats', JSON.stringify(stats));
    
    setTimeout(() => {
      setCurrentScreen('menu');
    }, 5000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'menu':
        return (
          <Menu 
            username={username} 
            onStartGame={handleStartGame} 
            onStats={() => setCurrentScreen('stats')} 
            onLeaderboards={() => setCurrentScreen('leaderboards')}
            onHelp={() => setCurrentScreen('help')} 
            onLogout={handleLogout} 
          />
        );
      case 'lifelines':
        return (
          <LifelinesSelection 
            onComplete={() => setCurrentScreen('game')} 
          />
        );
      case 'game':
        return (
          <Game 
            username={username}
            gameState={gameState}
            setGameState={setGameState}
            onGameOver={handleGameOver}
          />
        );
      case 'stats':
        return (
          <Stats 
            username={username} 
            onBack={() => setCurrentScreen('menu')} 
          />
        );
      case 'help':
        return (
          <Help 
            onBack={() => setCurrentScreen('menu')} 
          />
        );
      case 'leaderboards':
        return (
          <Leaderboards
            username={username}
            onBack={() => setCurrentScreen('menu')}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <Layout title={currentScreen === 'game' ? 'Playing Game' : 'QuizTime'}>
      {renderScreen()}
    </Layout>
  );
};

export default Page;
