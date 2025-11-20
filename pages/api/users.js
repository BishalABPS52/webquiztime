import connectToDatabase from '../../lib/mongodb';
import { User } from '../../lib/models';

/**
 * API endpoint to handle users data
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // GET request - Fetch users
    if (req.method === 'GET') {
      const { username } = req.query;
      
      // If username is provided, get specific user
      if (username) {
        const user = await User.findOne({ username });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ user });
      }
      
      // Otherwise, get all users (with limit)
      const limit = parseInt(req.query.limit) || 20;
      const users = await User.find({})
        .sort({ score: -1, lastActivity: -1 })
        .limit(limit);
      
      return res.status(200).json({ users });
    }
    
    // POST request - Create or update a user
    if (req.method === 'POST') {
      const { username, score } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // Find user or create new one
      let user = await User.findOne({ username });
      
      if (user) {
        // Update existing user
        if (typeof score === 'number') {
          user.score = Math.max(user.score, score); // Only update if new score is higher
        }
        user.lastActivity = new Date();
      } else {
        // Create new user
        user = new User({
          username,
          score: score || 0,
          questionsAnswered: [],
          lastActivity: new Date()
        });
      }
      
      await user.save();
      
      return res.status(200).json({ user });
    }
    
    // DELETE request - Delete a user
    if (req.method === 'DELETE') {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const result = await User.deleteOne({ username });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ success: true });
    }
    
    // Handle other request types
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error handling users:', error);
    res.status(500).json({ error: 'Server error handling users data' });
  }
}