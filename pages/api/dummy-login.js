// pages/api/dummy-login.js
import axios from 'axios';

// Get the external API URL from environment variables
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate inputs
    if (!email) {
      return res.status(400).json({ message: 'Missing email field' });
    }

    // Forward the request to the external API
    const response = await axios.post(`${EXTERNAL_API_URL}/dummy-login/`, {
      email
    });

    // Return the response from the external API
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Dummy login error:', error);
    
    // If we have a response from the API, return that error
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Dummy login failed',
        error: error.response.data
      });
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      message: 'Dummy login failed due to a server error',
      error: error.message
    });
  }
}