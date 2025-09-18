import React, { createContext, useContext, useState, useEffect } from 'react';
import { Howl } from 'howler';

// Create context
const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [sounds, setSounds] = useState({});

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
      // Add other sound effects here
    };

    setSounds(soundFiles);

    // Clean up function
    return () => {
      Object.values(soundFiles).forEach(sound => {
        sound.stop();
      });
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Mute/unmute all sounds
    Object.values(sounds).forEach(sound => {
      sound.mute(!isMuted);
    });
  };
  
  const adjustVolume = (newVolume) => {
    setVolume(newVolume);
    
    // Update volume for all sounds
    Object.values(sounds).forEach(sound => {
      sound.volume(newVolume);
    });
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

  return (
    <SoundContext.Provider value={{ 
      playSound, 
      stopSound, 
      pauseSound, 
      isMuted, 
      toggleMute,
      volume,
      adjustVolume
    }}>
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook to use the sound context
export const useSound = () => useContext(SoundContext);

export default SoundContext;
