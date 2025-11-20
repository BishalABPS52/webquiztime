// Proxy to backend API for authentication routes
const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  // Handle different auth endpoints
  const { slug = [] } = req.query;
  const endpoint = Array.isArray(slug) ? slug.join('/') : slug;
  
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          'Authorization': req.headers.authorization
        })
      },
      ...(req.body && { body: JSON.stringify(req.body) })
    });
    
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ 
      message: 'Failed to connect to backend API',
      error: error.message 
    });
  }
}