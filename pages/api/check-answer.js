import connectToDatabase from '../../lib/mongodb';
import { Question } from '../../lib/models';

/**
 * API endpoint to check if an answer is correct
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
    const { level, questionId, answer } = req.body;
    const validLevels = ['easy', 'medium', 'hard'];

    // Validate inputs
    if (!level || !validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    if (answer === undefined) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find the question
    const question = await Question.findOne({ id: questionId });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if the answer is correct
    const isCorrect = question.correct_answer === answer;

    // Return the result
    res.status(200).json({
      correct: isCorrect,
      correctAnswer: isCorrect ? null : question.correct_answer
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Server error checking answer' });
  }
}