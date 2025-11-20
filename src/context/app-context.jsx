import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Create context
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false); // Separate control for background music
  const [isSoundEffectsMuted, setIsSoundEffectsMuted] = useState(false); // Separate control for sound effects
  const [volume, setVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3); // Separate volume for background music
  const [soundEffectsVolume, setEffectsVolume] = useState(0.5); // Separate volume for sound effects
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const soundsRef = useRef({});

  // Game state
  const [highScores, setHighScores] = useState([]);
  const theme = 'default'; // Using only default theme
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [language, setLanguage] = useState('en'); // 'en', 'es', 'fr', etc.
  
  // Available theme definitions
  const themeDefinitions = {
    default: {
      name: 'Default',
      colors: {
        primary: '#3b82f6', // blue-500
        secondary: '#8b5cf6', // violet-500
        accent: '#f59e0b', // amber-500
        background: 'from-blue-900 to-purple-900',
        card: 'bg-white',
        text: 'text-gray-800',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        buttonText: 'text-white'
      }
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#1f2937', // gray-800
        secondary: '#4b5563', // gray-600
        accent: '#f59e0b', // amber-500
        background: 'from-gray-900 to-black',
        card: 'bg-gray-800',
        text: 'text-gray-100',
        buttonBg: 'bg-gray-700',
        buttonHover: 'hover:bg-gray-600',
        buttonText: 'text-white'
      }
    },
    light: {
      name: 'Light',
      colors: {
        primary: '#e5e7eb', // gray-200
        secondary: '#d1d5db', // gray-300
        accent: '#3b82f6', // blue-500
        background: 'from-gray-100 to-gray-300',
        card: 'bg-white',
        text: 'text-gray-800',
        buttonBg: 'bg-gray-200',
        buttonHover: 'hover:bg-gray-300',
        buttonText: 'text-gray-800'
      }
    },
    space: {
      name: 'Space',
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#7c3aed', // violet-600
        accent: '#10b981', // emerald-500
        background: 'from-slate-900 via-purple-900 to-slate-900',
        card: 'bg-gray-900',
        text: 'text-gray-100',
        buttonBg: 'bg-indigo-600',
        buttonHover: 'hover:bg-indigo-700',
        buttonText: 'text-white'
      }
    },
    retro: {
      name: 'Retro',
      colors: {
        primary: '#ef4444', // red-500
        secondary: '#f59e0b', // amber-500
        accent: '#10b981', // emerald-500
        background: 'from-amber-500 to-pink-500',
        card: 'bg-yellow-100',
        text: 'text-gray-800',
        buttonBg: 'bg-red-500',
        buttonHover: 'hover:bg-red-600',
        buttonText: 'text-white'
      }
    }
  };

  // Sound file definitions
  const soundDefinitions = {
    correct: { src: '/assets/sounds/correct.wav', volume: 0.5, loop: false },
    wrong: { src: '/assets/sounds/wrong.mp3', volume: 0.5, loop: false },
    background: { src: '/assets/sounds/music.wav', volume: 0.3, loop: true },
    click: { src: '/assets/sounds/click.wav', volume: 0.3, loop: false },
    timer: { src: '/assets/sounds/timer.wav', volume: 0.4, loop: false },
    // If win.mp3 doesn't exist, we'll just use correct.wav instead
    win: { src: '/assets/sounds/correct.wav', volume: 0.5, loop: false },
  };

  // Initialize sounds
  useEffect(() => {
    // Load previously saved sound settings
    try {
      // General mute state
      const savedMuteState = localStorage.getItem('isMuted');
      if (savedMuteState !== null) {
        setIsMuted(JSON.parse(savedMuteState));
      }
      
      // Music specific mute state
      const savedMusicMute = localStorage.getItem('isMusicMuted');
      if (savedMusicMute !== null) {
        setIsMusicMuted(JSON.parse(savedMusicMute));
      }
      
      // Sound effects specific mute state
      const savedEffectsMute = localStorage.getItem('isSoundEffectsMuted');
      if (savedEffectsMute !== null) {
        setIsSoundEffectsMuted(JSON.parse(savedEffectsMute));
      }
      
      // General volume
      const savedVolume = localStorage.getItem('volume');
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }
      
      // Music volume
      const savedMusicVolume = localStorage.getItem('musicVolume');
      if (savedMusicVolume !== null) {
        setMusicVolume(parseFloat(savedMusicVolume));
      }
      
      // Sound effects volume
      const savedEffectsVolume = localStorage.getItem('soundEffectsVolume');
      if (savedEffectsVolume !== null) {
        setEffectsVolume(parseFloat(savedEffectsVolume));
      }
    } catch (error) {
      console.error("Error loading sound preferences:", error);
    }

    // Initialize sound objects with proper error handling and loading events
    const soundFiles = {};
    let loadedCount = 0;
    const totalSounds = Object.keys(soundDefinitions).length;

    Object.entries(soundDefinitions).forEach(([name, config]) => {
      soundFiles[name] = new Howl({
        src: [config.src],
        volume: config.volume * volume, // Apply global volume
        loop: config.loop,
        mute: isMuted,
        onload: () => {
          loadedCount++;
          if (loadedCount === totalSounds) {
            setSoundsLoaded(true);
          }
        },
        onloaderror: (id, error) => {
          console.error(`Error loading sound ${name}:`, error);
          // Increment counter even on error to avoid blocking loading completion
          loadedCount++;
          if (loadedCount === totalSounds) {
            setSoundsLoaded(true);
          }
        },
        onplayerror: (id, error) => {
          console.error(`Error playing sound ${name}:`, error);
          // Attempt to recover playback
          soundFiles[name].once('unlock', () => {
            soundFiles[name].play();
          });
        }
      });
    });

    // Store in ref for stable reference
    soundsRef.current = soundFiles;

    // Clean up function
    return () => {
      Object.values(soundFiles).forEach(sound => {
        if (sound && sound.stop) {
          sound.stop();
        }
      });
    };
  }, []);

  // Initialize settings and preferences from localStorage
  useEffect(() => {
    try {
      const storedHighScores = localStorage.getItem('highScores');
      if (storedHighScores) {
        setHighScores(JSON.parse(storedHighScores));
      }
      
      // Always apply default theme
      applyThemeToDOM('default');
      
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
  
  // Apply theme CSS variables to the document
  const applyThemeToDOM = (themeName) => {
    const selectedTheme = themeDefinitions[themeName] || themeDefinitions.default;
    
    // Remove all existing theme classes from body
    Object.keys(themeDefinitions).forEach(key => {
      document.body.classList.remove(`theme-${key}`);
    });
    
    // Add the new theme class
    document.body.classList.add(`theme-${themeName}`);
    
    // Set CSS variables for the theme colors
    const root = document.documentElement;
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  // Sound functions
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Mute/unmute all sounds
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.mute) {
        sound.mute(newMuteState);
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('isMuted', JSON.stringify(newMuteState));
    } catch (error) {
      console.error("Error saving mute state:", error);
    }
  };
  
  // Toggle music only
  const toggleMusic = () => {
    const newMusicMuteState = !isMusicMuted;
    setIsMusicMuted(newMusicMuteState);
    
    // Only mute/unmute background music
    const backgroundMusic = soundsRef.current['background'];
    if (backgroundMusic && backgroundMusic.mute) {
      backgroundMusic.mute(newMusicMuteState);
    }
    
    // Save preference
    try {
      localStorage.setItem('isMusicMuted', JSON.stringify(newMusicMuteState));
    } catch (error) {
      console.error("Error saving music mute state:", error);
    }
  };
  
  // Toggle sound effects only
  const toggleSoundEffects = () => {
    const newEffectsMuteState = !isSoundEffectsMuted;
    setIsSoundEffectsMuted(newEffectsMuteState);
    
    // Mute/unmute all sound effects (everything except background music)
    Object.entries(soundsRef.current).forEach(([name, sound]) => {
      if (name !== 'background' && sound && sound.mute) {
        sound.mute(newEffectsMuteState);
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('isSoundEffectsMuted', JSON.stringify(newEffectsMuteState));
    } catch (error) {
      console.error("Error saving sound effects mute state:", error);
    }
  };
  
  const adjustVolume = (newVolume) => {
    setVolume(newVolume);
    
    // Update volume for all sounds
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.volume) {
        sound.volume(newVolume);
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('volume', newVolume.toString());
    } catch (error) {
      console.error("Error saving volume:", error);
    }
  };
  
  // Adjust music volume only
  const adjustMusicVolume = (newVolume) => {
    setMusicVolume(newVolume);
    
    // Only adjust background music volume
    const backgroundMusic = soundsRef.current['background'];
    if (backgroundMusic && backgroundMusic.volume) {
      backgroundMusic.volume(newVolume);
    }
    
    // Save preference
    try {
      localStorage.setItem('musicVolume', newVolume.toString());
    } catch (error) {
      console.error("Error saving music volume:", error);
    }
  };
  
  // Adjust sound effects volume only
  const adjustEffectsVolume = (newVolume) => {
    setEffectsVolume(newVolume);
    
    // Adjust all sound effects volume (everything except background music)
    Object.entries(soundsRef.current).forEach(([name, sound]) => {
      if (name !== 'background' && sound && sound.volume) {
        sound.volume(newVolume);
      }
    });
    
    // Save preference
    try {
      localStorage.setItem('soundEffectsVolume', newVolume.toString());
    } catch (error) {
      console.error("Error saving sound effects volume:", error);
    }
  };

  const playSound = (name) => {
    if (!soundsLoaded) {
      console.warn(`Attempted to play sound ${name} before sounds are loaded`);
      return;
    }
    
    const sound = soundsRef.current[name];
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return;
    }
    
    // Check if the sound should be muted based on type
    const isMusicSound = name === 'background';
    const shouldBeMuted = isMuted || 
                         (isMusicSound && isMusicMuted) || 
                         (!isMusicSound && isSoundEffectsMuted);
    
    if (!shouldBeMuted) {
      try {
        // Set appropriate volume based on sound type
        if (isMusicSound) {
          sound.volume(musicVolume);
        } else {
          sound.volume(soundEffectsVolume);
        }
        
        // Play and handle potential errors
        sound.play();
      } catch (error) {
        console.error(`Error playing sound ${name}:`, error);
      }
    }
  };

  const stopSound = (name) => {
    const sound = soundsRef.current[name];
    if (sound) {
      try {
        sound.stop();
      } catch (error) {
        console.error(`Error stopping sound ${name}:`, error);
      }
    }
  };

  const pauseSound = (name) => {
    const sound = soundsRef.current[name];
    if (sound) {
      try {
        sound.pause();
      } catch (error) {
        console.error(`Error pausing sound ${name}:`, error);
      }
    }
  };
  
  // Preload all sounds - useful to call after user interaction
  const preloadSounds = () => {
    if (!soundsLoaded) {
      Object.values(soundsRef.current).forEach(sound => {
        if (sound && sound.load) {
          sound.load();
        }
      });
    }
  };

  // Game settings functions

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
      preloadSounds,
      soundsLoaded,
      
      // Separate music controls
      isMusicMuted,
      toggleMusic,
      musicVolume,
      adjustMusicVolume,
      
      // Separate sound effects controls
      isSoundEffectsMuted,
      toggleSoundEffects,
      soundEffectsVolume,
      adjustEffectsVolume,
      
      // Theme related
      theme,
      
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
