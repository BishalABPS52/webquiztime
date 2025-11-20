/**
 * API endpoint to get available lifelines
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return available lifelines
  res.status(200).json({
    lifelines: [
      '50-50',
      'skip',
      'audience',
      'hint',
      'timer-extension'
    ]
  });
}