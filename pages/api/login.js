// pages/api/login.js
import axios from 'axios';

// Get the backend API URL from environment variables
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Forward the request to the backend API
    const response = await axios.post(`${BACKEND_API_URL}/api/login/`, {
      email,
      password
    });

    // Return the response from the external API
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Login error:', error);
    
    // If we have a response from the API, return that error
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Login failed',
        error: error.response.data
      });
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      message: 'Login failed due to a server error',
      error: error.message
    });
  }
}