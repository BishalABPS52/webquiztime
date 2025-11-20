import connectToDatabase from '../../lib/mongodb';
import { User } from '../../lib/models';

/**
 * API endpoint to handle user questions data
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // GET request - Fetch a user's questions data
    if (req.method === 'GET') {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ 
        username: user.username,
        questionsAnswered: user.questionsAnswered,
        score: user.score,
        lastActivity: user.lastActivity
      });
    }
    
    // POST request - Update a user's questions data
    if (req.method === 'POST') {
      const { username, questionId, score } = req.body;
      
      if (!username || !questionId) {
        return res.status(400).json({ error: 'Username and question ID are required' });
      }
      
      // Find the user or create a new one
      let user = await User.findOne({ username });
      
      if (!user) {
        user = new User({ 
          username,
          questionsAnswered: [questionId],
          score: score || 0,
          lastActivity: new Date()
        });
      } else {
        // Add the question to the answered list if not already there
        if (!user.questionsAnswered.includes(questionId)) {
          user.questionsAnswered.push(questionId);
        }
        
        // Update score if provided
        if (typeof score === 'number') {
          user.score += score;
        }
        
        user.lastActivity = new Date();
      }
      
      await user.save();
      
      return res.status(200).json({ 
        username: user.username,
        questionsAnswered: user.questionsAnswered,
        score: user.score,
        lastActivity: user.lastActivity
      });
    }
    
    // Handle other request types
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error handling user questions:', error);
    res.status(500).json({ error: 'Server error handling user questions data' });
  }
}