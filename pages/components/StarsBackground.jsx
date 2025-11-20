import React, { useEffect, useRef, memo } from 'react';
import styled from 'styled-components';

/**
 * Animated stars background component for space theme
 * Creates a canvas with animated twinkling stars
 * Optimized with React.memo and performance improvements
 */
const StarsBackground = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let stars = [];
    let animationFrameId;
    let resizeTimeout;

    // Set canvas dimensions
    const resizeCanvas = () => {
      // Clear any pending resize to avoid multiple calls
      clearTimeout(resizeTimeout);
      
      // Debounce resize to improve performance
      resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars(); // Reinitialize stars when canvas is resized
      }, 200);
    };

    // Create stars - optimized for performance
    const initStars = () => {
      stars = [];
      // Limit star count for better performance
      const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 5000)); 
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random(),
          speed: 0.003 + Math.random() * 0.005 // Slower animation for better performance
        });
      }
    };

    // Animation loop with performance optimizations
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars in batch for better performance
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Twinkle effect - only update every other frame for performance
        if (i % 2 === 0) {
          star.opacity += star.speed;
          
          if (star.opacity <= 0 || star.opacity >= 1) {
            star.speed = -star.speed;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <StyledCanvas ref={canvasRef} />;
});

// Add display name for React DevTools
StarsBackground.displayName = 'StarsBackground';

const StyledCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

export default StarsBackground;