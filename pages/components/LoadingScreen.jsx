import React, { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Loader from './Loader';
import StarsBackground from './StarsBackground';

/**
 * Loading screen component shown while data is loading
 * Uses the Earth-themed loader animation with a space background
 * Optimized with React.memo to prevent unnecessary re-renders
 * ONLY used for login to menu transition
 */
const LoadingScreen = memo(({ message = "" }) => {
  const router = useRouter();
  
  // Extra safeguard - if not coming from login page, don't show
  useEffect(() => {
    const currentPath = router.pathname;
    const previousPath = router.asPath.split('?')[0];
    
    // If not related to login->menu transition, don't show
    if (!(previousPath === '/login' && currentPath === '/menu')) {
      // No need to actually render anything in this case
      console.log('LoadingScreen prevented from showing on non-login-to-menu transition');
    }
  }, [router]);
  
  // STRICT check: Only show for login->menu transition
  // Check if we're on menu page AND came from login
  const isLoginToMenuTransition = 
    router.pathname === '/menu' && 
    router.asPath.includes('previous=login');
  
  // If not explicitly the login->menu transition, don't render anything
  if (!isLoginToMenuTransition && router.pathname !== '/login') {
    console.log('LoadingScreen prevented - not login->menu transition');
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-900 to-black overflow-hidden">
      {/* Stars background */}
      <StarsBackground />
      
      {/* Content container with z-index to appear above stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="z-10 w-full max-w-lg p-8 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl shadow-2xl text-center border border-blue-500"
        style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
      >
        {message && <h2 className="text-2xl font-bold text-blue-400 mb-6">{message}</h2>}
        
        <div className="flex justify-center items-center my-8">
          <Loader />
        </div>
      </motion.div>
    </div>
  );
});

// Add display name for React DevTools
LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;