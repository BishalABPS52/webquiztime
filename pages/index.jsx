import { useEffect } from 'react';
import { useRouter } from 'next/router';
import QuizTimeAPI from '../src/services/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (QuizTimeAPI.isAuthenticated()) {
      router.push('/menu');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}
