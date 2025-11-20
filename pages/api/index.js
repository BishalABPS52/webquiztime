/**
 * API index endpoint
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default function handler(req, res) {
  res.status(200).json({
    message: 'Welcome to QuizTime API',
    version: '1.0.0',
    endpoints: {
      questions: '/api/questions - Get quiz questions (POST)',
      lifelines: '/api/lifelines - Get available lifelines (GET)',
      checkAnswer: '/api/check-answer - Verify answers (POST)',
      stats: '/api/stats - Save user statistics (POST) or get user statistics (GET)',
      userStats: '/api/stats/[username] - Get specific user statistics (GET)',
      leaderboard: '/api/leaderboard - Get game leaderboard (GET)'
    }
  });
}