// Next.js API route for admin login
// This is just a simple authentication endpoint that will be replaced with a more secure solution in the backend

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get credentials from request body
  const { username, password } = req.body;

  // Simple validation - in production, this would connect to a secure backend service
  if (username === 'admin' && password === 'quiztime2023') {
    // In a real implementation, this would set a secure JWT token or session
    return res.status(200).json({ 
      message: 'Authentication successful',
      // This token is just for demonstration, not secure for production
      token: 'temp-demo-token'
    });
  }

  // Authentication failed
  return res.status(401).json({ message: 'Invalid username or password' });
}