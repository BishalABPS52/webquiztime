// pages/api/user/profile.js
import axios from 'axios';

// Get the external API URL from environment variables
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];

    // Try external API first
    try {
      const response = await axios.get(`${EXTERNAL_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Return the response from the external API
      return res.status(response.status).json(response.data);
    } catch (externalError) {
      console.log('External API failed, using mock data for development');
      
      // Decode token to get user info (for development only)
      let userData = { username: 'Player', email: 'player@example.com' };
      
      try {
        // Simple JWT decode (not for production!)
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData = {
          username: payload.username || 'Player',
          email: payload.email || 'player@example.com',
          id: payload.id || '1'
        };
      } catch (decodeError) {
        console.log('Could not decode token, using defaults');
      }
      
      // Return mock user data for development
      return res.status(200).json({
        success: true,
        user: userData
      });
    }
  } catch (error) {
    console.error('User profile error:', error);
    return res.status(500).json({
      message: 'Failed to fetch user profile due to a server error',
      error: error.message
    });
  }
}