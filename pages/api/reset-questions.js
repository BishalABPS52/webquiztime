import connectToDatabase from '../../lib/mongodb';
import { User } from '../../lib/models';

/**
 * API endpoint to reset a user's question history
 * Used primarily for testing purposes
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reset the questions answered
    user.questionsAnswered = [];
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error resetting questions:', error);
    res.status(500).json({ error: 'Server error resetting questions' });
  }
}