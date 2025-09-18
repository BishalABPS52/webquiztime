const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * API service for interacting with the QuizTime backend
 */
class QuizTimeAPI {
  /**
   * Fetch questions for a specific level
   * @param {string} username - User's username
   * @param {string} level - Difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to fetch
   * @returns {Promise<Array>} Array of question objects
   */
  static async getQuestions(username, level, count = 20) {
    try {
      const response = await fetch(`${API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, level, count }),
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching questions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
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
      const response = await fetch(`${API_URL}/api/check-answer`, {
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
      throw error;
    }
  }

  /**
   * Get available lifelines
   * @returns {Promise<Object>} Object with lifelines array
   */
  static async getLifelines() {
    try {
      const response = await fetch(`${API_URL}/api/lifelines`);
      
      if (!response.ok) {
        throw new Error(`Error fetching lifelines: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch lifelines:', error);
      throw error;
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
      const response = await fetch(`${API_URL}/api/stats`, {
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
      throw error;
    }
  }

  /**
   * Get user's stats
   * @param {string} username - User's username
   * @returns {Promise<Object>} User statistics
   */
  static async getUserStats(username) {
    try {
      const response = await fetch(`${API_URL}/api/stats/${username}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   * @returns {Promise<Object>} Leaderboard data
   */
  static async getLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      
      if (!response.ok) {
        throw new Error(`Error fetching leaderboard: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }

  /**
   * Reset a user's question history (for testing)
   * @param {string} username - User's username
   * @returns {Promise<Object>} Success status
   */
  static async resetUserQuestions(username) {
    try {
      const response = await fetch(`${API_URL}/api/reset-questions`, {
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
      throw error;
    }
  }
}

export default QuizTimeAPI;