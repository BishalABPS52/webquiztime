import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Game from './pages/Game';
import Stats from './pages/Stats';
import Help from './pages/Help';

// Main App component that uses the GameProvider
const App = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

// AppContent component to use the context
const AppContent = () => {
  const { 
    currentScreen,
    username,
    login,
    logout,
    startGame,
    goToMenu,
    goToStats,
    goToHelp,
    stats
  } = useGame();

  // Render different screens based on currentScreen state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={login} />;
      case 'menu':
        return (
          <Menu 
            username={username} 
            onStartGame={startGame}
            onStats={goToStats}
            onHelp={goToHelp}
            onLogout={logout}
          />
        );
      case 'game':
        return <Game username={username} onReturnToMenu={goToMenu} />;
      case 'stats':
        return <Stats username={username} stats={stats} onBack={goToMenu} />;
      case 'help':
        return <Help onBack={goToMenu} />;
      default:
        return <Login onLogin={login} />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
};

export default App;
