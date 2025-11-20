import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QuizTimeAPI from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

/**
 * AuthGuard is a Higher Order Component (HOC) that protects routes
 * requiring authentication. It checks if the user is authenticated
 * and redirects to login if not.
 */
const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    
    useEffect(() => {
      const checkAuth = async () => {
        try {
          if (!QuizTimeAPI.isAuthenticated()) {
            throw new Error('Not authenticated');
          }
          
          // Verify token validity by making an API call
          await QuizTimeAPI.getUserProfile();
          setAuthenticated(true);
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Redirect to login page
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      };
      
      checkAuth();
    }, [router]);
    
    if (loading) {
      return <LoadingScreen message="" />;
    }
    
    if (!authenticated) {
      return null; // Will be redirected by the useEffect
    }
    
    return <WrappedComponent {...props} />;
  };
  
  return WithAuth;
};

export default withAuth;