// pages/api/questions/random.js
import axios from 'axios';

// Get the backend API URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { count = 16 } = req.body;

    // Forward the request to the backend API
    const response = await axios.post(`${BACKEND_API_URL}/api/questions/random`, {
      count
    });

    // Return the response from the backend API
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Random questions error:', error);
    
    // If we have a response from the API, return that error
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Failed to fetch random questions',
        error: error.response.data
      });
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      message: 'Failed to fetch random questions due to a server error',
      error: error.message
    });
  }
}