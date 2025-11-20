import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import LoadingScreen only when needed
const LoadingScreen = dynamic(() => import('../../pages/components/LoadingScreen'));

// List of routes that should never show loading screens when navigating to them
const DIRECT_NAVIGATION_ROUTES = [
  '/stats', 
  '/leaderboard',
  '/game',
  '/help',
  '/profile'
];

// Create the loading context
const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isLoginToMenuTransition, setIsLoginToMenuTransition] = useState(false);

  // Track route changes to determine which loading screen to show
  useEffect(() => {
    const handleRouteChange = (url) => {
      // ONLY show loading screen for login to menu transition
      if (router.pathname === '/login' && url === '/menu') {
        if (loading) {
          setIsLoginToMenuTransition(true);
        }
      } else {
        // For ALL other transitions, NEVER show loading
        setLoading(false);
        setIsLoginToMenuTransition(false);
      }
    };

    // Also intercept route change complete to ensure loading is stopped
    const handleRouteComplete = () => {
      // Only keep loading on menu page if coming from login
      if (router.pathname !== '/menu' || router.asPath.includes('previous=login') === false) {
        setLoading(false);
        setIsLoginToMenuTransition(false);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);
    router.events.on('routeChangeError', handleRouteComplete); // Also stop loading on error
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.off('routeChangeError', handleRouteComplete);
    };
  }, [router, loading]);

  // Start loading with optional message
  const startLoading = (message = 'Loading...', forceSpaceTheme = false) => {
    // STRICTLY only show loading if it's login to menu transition
    // or if explicitly forced with forceSpaceTheme=true
    if ((router.pathname === '/login' && message.includes('quiz')) || forceSpaceTheme === true) {
      setLoadingMessage(message);
      setLoading(true);
      setIsLoginToMenuTransition(true);
      console.log('Loading screen enabled for login->menu transition');
    } else {
      // Don't show loading for ANY other transitions
      console.log('Loading suppressed - only allowed for login->menu transitions');
    }
  };

  // Stop loading
  const stopLoading = () => {
    setLoading(false);
    setIsLoginToMenuTransition(false);
  };

  return (
    <LoadingContext.Provider value={{ 
      loading, 
      loadingMessage, 
      startLoading, 
      stopLoading,
      isLoginToMenuTransition
    }}>
      {children}
      
      {/* Global loading overlay - conditionally show fancy or simple loader */}
      {loading && isLoginToMenuTransition ? (
        // Space-themed loader only for login to menu transition
        <LoadingScreen message={loadingMessage} />
      ) : loading ? (
        // Simple loader for all other transitions
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700">{loadingMessage}</p>
          </div>
        </div>
      ) : null}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

export default LoadingContext;