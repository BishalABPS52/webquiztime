// Use production backend URL as default, fallback to environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiztime-backend-efv0.onrender.com';

// Import mock data service for fallback
import MockDataService from './mockData';

/**
 * Check if the device is online
 * @returns {boolean} True if device has internet connection
 */
const isOnline = () => {
  return typeof navigator !== 'undefined' && 
    typeof navigator.onLine === 'boolean' ? 
    navigator.onLine : true;
};

/**
 * Helper to get the authentication token
 * @returns {string|null} JWT token
 */
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('quiztime-token');
};

/**
 * Add authorization header to fetch options if token exists
 * @param {Object} options - Fetch options
 * @returns {Object} Updated fetch options with auth header if token exists
 */
const withAuth = (options = {}) => {
  const token = getToken();
  if (!token) return options;
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
};

/**
 * API service for interacting with the QuizTime backend
 */
class QuizTimeAPI {
  /**
   * Register a new user
   * @param {Object} userData - User registration data (username, email, password)
   * @returns {Promise<Object>} Registration result
   */
  static async register(userData) {
    try {
      const response = await fetch(`/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/register/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          const data = await externalResponse.json();
          
          if (!externalResponse.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          
          return data;
        } catch (externalError) {
          console.error('Failed to register with external API:', externalError);
          throw externalError;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Verify email with code
   * @param {Object} verificationData - Email and verification code
   * @returns {Promise<Object>} Verification result
   */
  static async verifyEmail(verificationData) {
    try {
      const response = await fetch(`/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }
      
      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/verify-email/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verificationData),
          });
          
          const data = await externalResponse.json();
          
          if (!externalResponse.ok) {
            throw new Error(data.message || 'Email verification failed');
          }
          
          return data;
        } catch (externalError) {
          console.error('Failed to verify email with external API:', externalError);
          throw externalError;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise<Object>} Login result with token
   */
  static async login(credentials) {
    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('quiztime-token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          const data = await externalResponse.json();
          
          if (!externalResponse.ok) {
            throw new Error(data.message || 'Login failed');
          }
          
          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('quiztime-token', data.token);
          }
          
          return data;
        } catch (externalError) {
          console.error('Failed to login with external API:', externalError);
          throw externalError;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Login user using dummy authentication (for development)
   * @param {Object} credentials - User credentials (only email required)
   * @returns {Promise<Object>} Login result with token
   */
  static async dummyLogin(credentials) {
    try {
      console.log('Using dummy login with email:', credentials.email);
      const response = await fetch(`/api/dummy-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Dummy login failed');
      }
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('quiztime-token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Dummy login error:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/dummy-login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          const data = await externalResponse.json();
          
          if (!externalResponse.ok) {
            throw new Error(data.message || 'Dummy login failed');
          }
          
          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('quiztime-token', data.token);
          }
          
          return data;
        } catch (externalError) {
          console.error('Failed to dummy login with external API:', externalError);
          throw externalError;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  static async getUserProfile() {
    try {
      const response = await fetch(`/api/user/profile`, withAuth());
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('quiztime-token');
        }
        throw new Error(`Error fetching user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/user/profile`, withAuth());
          
          if (!externalResponse.ok) {
            if (externalResponse.status === 401) {
              localStorage.removeItem('quiztime-token');
            }
            throw new Error(`Error fetching user profile from external API: ${externalResponse.statusText}`);
          }
          
          return await externalResponse.json();
        } catch (externalError) {
          console.error('Failed to fetch user profile from external API:', externalError);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  static isAuthenticated() {
    return !!getToken();
  }
  
  /**
   * Logout user
   */
  static logout() {
    localStorage.removeItem('quiztime-token');
  }
  /**
   * Fetch game questions with level progression (Q1-Q3: easy 10s, Q4-Q9: medium 20s, Q10-Q15: hard 30s)
   * @param {string} username - User's username
   * @returns {Promise<Object>} Object with questions array and game structure
   */
  static async getGameQuestions(username) {
    try {
      // Add session ID to force new questions each time
      const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`/api/game/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ username, sessionId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching game questions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response format
      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Invalid response format or empty question list received from API');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch game questions:', error);
      
      // Fallback to mock data with proper structure (16 questions total)
      const mockQuestions = [];
      const prizeStructure = [
        1000, 2000, 3000, // Easy (Q1-Q3)
        5000, 10000, 20000, 50000, 100000, 200000, // Medium (Q4-Q9) 
        500000, 1000000, 2000000, 5000000, 10000000, 50000000, 700000000 // Hard (Q10-Q16)
      ];
      
      // Question pools for random selection
      const easyQuestionPool = [
        { question: "What is 2 + 2?", options: ['3', '4', '5', '6'], answer: 1 },
        { question: "Which color comes from mixing red and yellow?", options: ['Green', 'Orange', 'Purple', 'Blue'], answer: 1 },
        { question: "How many days are in a week?", options: ['5', '6', '7', '8'], answer: 2 },
        { question: "What is the capital of India?", options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], answer: 1 },
        { question: "Which animal is known as the king of the jungle?", options: ['Tiger', 'Lion', 'Elephant', 'Bear'], answer: 1 }
      ];
      
      const mediumQuestionPool = [
        { question: "What is the capital of France?", options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 2 },
        { question: "Which planet is known as the Red Planet?", options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
        { question: "Who wrote Romeo and Juliet?", options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1 },
        { question: "What is the largest ocean on Earth?", options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], answer: 1 },
        { question: "In which year did World War II end?", options: ['1944', '1945', '1946', '1947'], answer: 1 },
        { question: "What is the chemical symbol for gold?", options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
        { question: "Which continent is the largest?", options: ['Africa', 'Asia', 'Europe', 'North America'], answer: 1 },
        { question: "Who invented the telephone?", options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Benjamin Franklin'], answer: 1 }
      ];
      
      const hardQuestionPool = [
        { question: "Who painted the Mona Lisa?", options: ['Van Gogh', 'Leonardo da Vinci', 'Picasso', 'Michelangelo'], answer: 1 },
        { question: "What is the speed of light in vacuum?", options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '298,000,000 m/s'], answer: 0 },
        { question: "Which element has the atomic number 79?", options: ['Silver', 'Gold', 'Platinum', 'Mercury'], answer: 1 },
        { question: "In which year was the first computer bug found?", options: ['1945', '1946', '1947', '1948'], answer: 2 },
        { question: "What is the smallest prime number?", options: ['0', '1', '2', '3'], answer: 2 },
        { question: "Who developed the theory of relativity?", options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'], answer: 1 },
        { question: "What is the longest river in the world?", options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 1 },
        { question: "Which programming language was created by Guido van Rossum?", options: ['Java', 'Python', 'C++', 'JavaScript'], answer: 1 }
      ];
      
      // Randomly shuffle and select questions
      const shuffledEasy = [...easyQuestionPool].sort(() => Math.random() - 0.5);
      const shuffledMedium = [...mediumQuestionPool].sort(() => Math.random() - 0.5);
      const shuffledHard = [...hardQuestionPool].sort(() => Math.random() - 0.5);
      
      // Easy questions (Q1-Q3, 10 seconds) - random selection
      for (let i = 0; i < 3; i++) {
        const q = shuffledEasy[i % shuffledEasy.length];
        mockQuestions.push({
          id: `easy_${Date.now()}_${i}`,
          question: q.question,
          options: q.options,
          answer: q.answer,
          questionNumber: i + 1,
          timeLimit: 10,
          level: 'easy',
          prizeValue: prizeStructure[i]
        });
      }
      
      // Medium questions (Q4-Q9, 20 seconds) - random selection
      for (let i = 0; i < 6; i++) {
        const q = shuffledMedium[i % shuffledMedium.length];
        mockQuestions.push({
          id: `medium_${Date.now()}_${i}`,
          question: q.question,
          options: q.options,
          answer: q.answer,
          questionNumber: i + 4,
          timeLimit: 20,
          level: 'medium',
          prizeValue: prizeStructure[i + 3]
        });
      }
      
      // Hard questions (Q10-Q16, 30 seconds) - 7 questions, random selection
      for (let i = 0; i < 7; i++) {
        const q = shuffledHard[i % shuffledHard.length];
        mockQuestions.push({
          id: `hard_${Date.now()}_${i}`,
          question: q.question,
          options: q.options,
          answer: q.answer,
          questionNumber: i + 10,
          timeLimit: 30,
          level: 'hard',
          prizeValue: prizeStructure[i + 9]
        });
      }
      
      return {
        questions: mockQuestions,
        totalQuestions: 16,
        gameStructure: {
          easy: { questions: '1-3', timeLimit: 10, prize: '1K-3K' },
          medium: { questions: '4-9', timeLimit: 20, prize: '5K-200K' },
          hard: { questions: '10-16', timeLimit: 30, prize: '500K-700M' }
        }
      };
    }
  }

  /**
   * Fetch random questions without level restrictions
   * @param {string} username - User's username  
   * @param {number} count - Number of questions to fetch
   * @returns {Promise<Array>} Array of question objects
   */
  static async getRandomQuestions(username, count = 16) {
    try {
      console.log(`Fetching ${count} random questions for ${username}`);
      
      const response = await fetch(`/api/questions/random`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching random questions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch random questions:', error);
      
      // Fallback to mock data
      const mockQuestions = [];
      const questionPool = [
        { id: 'q1', question: "What is 2 + 2?", options: ['3', '4', '5', '6'], answer: '4' },
        { id: 'q2', question: "What is the capital of France?", options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 'Paris' },
        { id: 'q3', question: "Which planet is known as the Red Planet?", options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
        { id: 'q4', question: "Who wrote Romeo and Juliet?", options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 'William Shakespeare' },
        { id: 'q5', question: "What is the largest ocean on Earth?", options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], answer: 'Pacific' },
        { id: 'q6', question: "In which year did World War II end?", options: ['1944', '1945', '1946', '1947'], answer: '1945' },
        { id: 'q7', question: "What is the chemical symbol for gold?", options: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au' },
        { id: 'q8', question: "Which continent is the largest?", options: ['Africa', 'Asia', 'Europe', 'North America'], answer: 'Asia' },
        { id: 'q9', question: "Who invented the telephone?", options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Benjamin Franklin'], answer: 'Alexander Graham Bell' },
        { id: 'q10', question: "Who painted the Mona Lisa?", options: ['Van Gogh', 'Leonardo da Vinci', 'Picasso', 'Michelangelo'], answer: 'Leonardo da Vinci' },
        { id: 'q11', question: "What is the speed of light in vacuum?", options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '298,000,000 m/s'], answer: '299,792,458 m/s' },
        { id: 'q12', question: "Which element has the atomic number 79?", options: ['Silver', 'Gold', 'Platinum', 'Mercury'], answer: 'Gold' },
        { id: 'q13', question: "What is the smallest prime number?", options: ['0', '1', '2', '3'], answer: '2' },
        { id: 'q14', question: "Who developed the theory of relativity?", options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'], answer: 'Albert Einstein' },
        { id: 'q15', question: "What is the longest river in the world?", options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 'Nile' },
        { id: 'q16', question: "Which programming language was created by Guido van Rossum?", options: ['Java', 'Python', 'C++', 'JavaScript'], answer: 'Python' }
      ];
      
      // Shuffle and return requested count
      const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
  }

  /**
   * Fetch questions for a specific level (backwards compatibility)
   * @param {string} username - User's username
   * @param {string} level - Difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to fetch
   * @returns {Promise<Array>} Array of question objects
   */
  static async getQuestions(username, level, count = 20) {
    // First check if device is online
    if (!isOnline()) {
      console.warn('Device appears to be offline. Using mock data instead.');
      return MockDataService.getQuestions(level, count);
    }
    
    try {
      console.log(`Fetching ${count} questions of ${level} difficulty for ${username}`);
      
      // Use local API endpoint first (relative path)
      const response = await fetch(`/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, level, count }),
      });
      
      if (!response.ok) {
        const errorMessage = `Error fetching questions: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Validate response format
      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Invalid response format or empty question list received from API');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch questions from primary API:', error);
      
      // If internal API fails, try external API if available
      if (API_URL) {
        try {
          console.log(`Attempting to fetch questions from external API at ${API_URL}`);
          const externalResponse = await fetch(`${API_URL}/api/questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, level, count }),
          });
          
          if (!externalResponse.ok) {
            throw new Error(`Error fetching questions from external API: ${externalResponse.status} ${externalResponse.statusText}`);
          }
          
          const data = await externalResponse.json();
          
          // Validate response format
          if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error('Invalid response format or empty question list received from external API');
          }
          
          return data;
        } catch (externalError) {
          console.error('Failed to fetch questions from external API:', externalError);
          console.log('Falling back to mock data service');
          return MockDataService.getQuestions(level, count);
        }
      } else {
        console.log('No external API URL configured. Falling back to mock data service');
        return MockDataService.getQuestions(level, count);
      }
    }
  }

  /**
   * Check if an answer is correct
   * @param {string} level - Difficulty level
   * @param {string} questionId - Question ID
   * @param {string} answer - User's answer
   * @returns {Promise<Object>} Object with correct status and correctAnswer if wrong
   */
  static async checkAnswer(level, questionId, answer) {
    try {
      const response = await fetch(`/api/check-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level, questionId, answer }),
      });
      
      if (!response.ok) {
        throw new Error(`Error checking answer: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to check answer:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/check-answer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ level, questionId, answer }),
          });
          
          if (!externalResponse.ok) {
            throw new Error(`Error checking answer from external API: ${externalResponse.statusText}`);
          }
          
          return await externalResponse.json();
        } catch (externalError) {
          console.error('Failed to check answer from external API:', externalError);
        }
      }
      throw error;
    }
  }

  /**
   * Get available lifelines
   * @returns {Promise<Object>} Object with lifelines array
   */
  static async getLifelines() {
    try {
      const response = await fetch(`/api/lifelines`);
      
      if (!response.ok) {
        throw new Error(`Error fetching lifelines: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch lifelines:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/lifelines`);
          
          if (!externalResponse.ok) {
            throw new Error(`Error fetching lifelines from external API: ${externalResponse.statusText}`);
          }
          
          return await externalResponse.json();
        } catch (externalError) {
          console.error('Failed to fetch lifelines from external API:', externalError);
        }
      }
      
      // Return default lifelines if both APIs fail
      return {
        lifelines: [
          { id: '50-50', name: '50:50', description: 'Removes two incorrect options' },
          { id: 'skip', name: 'Skip', description: 'Skip to the next question' },
          { id: 'change', name: 'Change', description: 'Change current question to a new one' },
          { id: 'pause', name: 'Pause', description: 'Pause the timer for 30 seconds' },
          { id: 'double', name: 'Double Chance', description: 'Get a second attempt if you answer incorrectly' }
        ]
      };
    }
  }

  /**
   * Save user's game stats
   * @param {string} username - User's username
   * @param {Object} stats - Game statistics
   * @returns {Promise<Object>} Success status
   */
  static async saveStats(username, stats) {
    try {
      const response = await fetch(`/api/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ...stats
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error saving stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save stats:', error);
      
      // Try production backend server
      try {
        console.log(`Saving stats to backend: ${API_URL}`);
        const externalResponse = await fetch(`${API_URL}/api/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            ...stats
          }),
        });
        
        if (externalResponse.ok) {
          console.log('Stats saved to backend server successfully');
          return await externalResponse.json();
        } else {
          throw new Error(`Error saving stats to backend server: ${externalResponse.statusText}`);
        }
      } catch (externalError) {
        console.error('Failed to save stats to backend server:', externalError);
      }
      
      // If both APIs fail, at least return a success message to not block the user experience
      return { success: true, warning: 'Stats saved locally only' };
    }
  }

  /**
   * Get user's stats
   * @param {string} username - User's username
   * @returns {Promise<Object>} User statistics
   */
  static async getUserStats(username) {
    // Try production backend server first
    try {
      console.log(`Fetching user stats for ${username} from backend: ${API_URL}`);
      const externalResponse = await fetch(`${API_URL}/api/stats/${username}`);
      
      if (externalResponse.ok) {
        const data = await externalResponse.json();
        console.log('User stats fetched from backend successfully');
        return data;
      }
    } catch (externalError) {
      console.error('Failed to fetch user stats from backend server:', externalError);
    }
    
    // Fallback to local API
    try {
      const response = await fetch(`/api/stats/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user stats from local API:', error);
      
      // Return empty stats if both APIs fail
      return {
        stats: {
          score: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          averageTimePerQuestion: 0,
          totalTime: 0,
          lifelinesUsed: {}
        }
      };
    }
  }

  /**
   * Get leaderboard
   * @returns {Promise<Object>} Leaderboard data
   */
  static async getLeaderboard() {
    // Try production backend server first
    try {
      console.log(`Fetching leaderboard from backend: ${API_URL}`);
      const externalResponse = await fetch(`${API_URL}/api/leaderboard`);
      
      if (externalResponse.ok) {
        const data = await externalResponse.json();
        console.log('Leaderboard fetched from backend successfully');
        return data;
      }
    } catch (externalError) {
      console.error('Failed to fetch leaderboard from backend server:', externalError);
    }
    
    // Fallback to local API
    try {
      const response = await fetch(`/api/leaderboard`);
      
      if (!response.ok) {
        throw new Error(`Error fetching leaderboard: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch leaderboard from local API:', error);
      
      // Return empty leaderboard if both APIs fail
      return { leaderboard: [] };
    }
  }

  /**
   * Save game results (stats and leaderboard)
   * @param {Object} gameResult - Game result data
   * @returns {Promise<Object>} Save result
   */
  static async saveGameResult(gameResult) {
    try {
      const response = await fetch(`/api/game/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(gameResult),
      });
      
      if (!response.ok) {
        throw new Error(`Error saving game result: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save game result:', error);
      
      // Try production backend server
      try {
        console.log(`Saving game result to backend: ${API_URL}`);
        const externalResponse = await fetch(`${API_URL}/api/game/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(gameResult),
        });
        
        if (externalResponse.ok) {
          console.log('Game result saved to backend server successfully');
          return await externalResponse.json();
        } else {
          throw new Error(`Error saving game result to backend server: ${externalResponse.statusText}`);
        }
      } catch (externalError) {
        console.error('Failed to save game result to backend server:', externalError);
      }
      
      // Return success to not block the user experience
      return { success: true, warning: 'Game result saved locally only' };
    }
  }

  /**
   * Reset a user's question history (for testing)
   * @param {string} username - User's username
   * @returns {Promise<Object>} Success status
   */
  static async resetUserQuestions(username) {
    try {
      const response = await fetch(`/api/reset-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        throw new Error(`Error resetting questions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to reset questions:', error);
      
      // Try external API if available
      if (API_URL) {
        try {
          const externalResponse = await fetch(`${API_URL}/api/reset-questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });
          
          if (!externalResponse.ok) {
            throw new Error(`Error resetting questions from external API: ${externalResponse.statusText}`);
          }
          
          return await externalResponse.json();
        } catch (externalError) {
          console.error('Failed to reset questions from external API:', externalError);
        }
      }
      
      // Return success to not block the user experience
      return { success: true };
    }
  }
}

export default QuizTimeAPI;