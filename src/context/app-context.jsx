import React, { createContext, useContext, useState, useEffect } from 'react';
import { Howl } from 'howler';

// Create context
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [sounds, setSounds] = useState({});

  // Game state
  const [highScores, setHighScores] = useState([]);
  const [theme, setTheme] = useState('default'); // Could be 'default', 'dark', 'light', etc.
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [language, setLanguage] = useState('en'); // 'en', 'es', 'fr', etc.

  // Initialize sounds
  useEffect(() => {
    // Initialize sound objects
    const soundFiles = {
      correct: new Howl({
        src: ['/assets/sounds/correct.mp3'],
        volume: 0.5,
      }),
      wrong: new Howl({
        src: ['/assets/sounds/wrong.mp3'],
        volume: 0.5,
      }),
      background: new Howl({
        src: ['/assets/sounds/background.mp3'],
        volume: 0.3,
        loop: true,
      }),
      click: new Howl({
        src: ['/assets/sounds/click.mp3'],
        volume: 0.3,
      }),
      timer: new Howl({
        src: ['/assets/sounds/timer.mp3'],
        volume: 0.4,
      }),
      win: new Howl({
        src: ['/assets/sounds/win.mp3'],
        volume: 0.5,
      }),
    };

    setSounds(soundFiles);

    // Clean up function
    return () => {
      Object.values(soundFiles).forEach(sound => {
        sound.stop();
      });
    };
  }, []);

  // Initialize high scores from localStorage
  useEffect(() => {
    try {
      const storedHighScores = localStorage.getItem('highScores');
      if (storedHighScores) {
        setHighScores(JSON.parse(storedHighScores));
      }
      
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      }
      
      const storedDifficulty = localStorage.getItem('difficulty');
      if (storedDifficulty) {
        setDifficulty(storedDifficulty);
      }
      
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    } catch (error) {
      console.error("Error loading stored settings:", error);
    }
  }, []);

  // Sound functions
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Mute/unmute all sounds
    Object.values(sounds).forEach(sound => {
      sound.mute(newMuteState);
    });
    
    // Save preference
    try {
      localStorage.setItem('isMuted', JSON.stringify(newMuteState));
    } catch (error) {
      console.error("Error saving mute state:", error);
    }
  };
  
  const adjustVolume = (newVolume) => {
    setVolume(newVolume);
    
    // Update volume for all sounds
    Object.values(sounds).forEach(sound => {
      sound.volume(newVolume);
    });
    
    // Save preference
    try {
      localStorage.setItem('volume', newVolume);
    } catch (error) {
      console.error("Error saving volume:", error);
    }
  };

  const playSound = (name) => {
    if (sounds[name] && !isMuted) {
      sounds[name].volume(volume);
      sounds[name].play();
    }
  };

  const stopSound = (name) => {
    if (sounds[name]) {
      sounds[name].stop();
    }
  };

  const pauseSound = (name) => {
    if (sounds[name]) {
      sounds[name].pause();
    }
  };

  // Game settings functions
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    try {
      localStorage.setItem('difficulty', newDifficulty);
    } catch (error) {
      console.error("Error saving difficulty:", error);
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    try {
      localStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  // High score functions
  const addHighScore = (name, score) => {
    const newHighScore = { name, score, date: new Date().toISOString() };
    const newHighScores = [...highScores, newHighScore]
      .sort((a, b) => b.score - a.score) // Sort in descending order
      .slice(0, 10); // Keep only top 10
      
    setHighScores(newHighScores);
    
    try {
      localStorage.setItem('highScores', JSON.stringify(newHighScores));
    } catch (error) {
      console.error("Error saving high scores:", error);
    }
  };

  const clearHighScores = () => {
    setHighScores([]);
    try {
      localStorage.removeItem('highScores');
    } catch (error) {
      console.error("Error clearing high scores:", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      // Sound related
      playSound, 
      stopSound, 
      pauseSound, 
      isMuted, 
      toggleMute,
      volume,
      adjustVolume,
      
      // Theme related
      theme,
      changeTheme,
      
      // Game settings
      difficulty,
      changeDifficulty,
      language,
      changeLanguage,
      
      // High scores
      highScores,
      addHighScore,
      clearHighScores
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => useContext(AppContext);

export default AppContext;
