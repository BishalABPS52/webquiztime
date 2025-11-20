import connectToDatabase from '../../../lib/mongodb';
import { Stats } from '../../../lib/models';

/**
 * API endpoint to get stats for a specific user
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get username from URL
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Get user stats
    const stats = await Stats.findOne({ username });

    if (!stats) {
      return res.status(200).json({ 
        stats: {
          score: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          averageTimePerQuestion: 0,
          totalTime: 0,
          lifelinesUsed: {}
        }
      });
    }

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
}