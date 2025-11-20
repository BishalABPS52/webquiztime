import connectToDatabase from '../../lib/mongodb';
import { Question, User } from '../../lib/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to get questions based on difficulty level
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Handle GET and POST requests
    let username, level, count;
    
    if (req.method === 'POST') {
      // Extract from body for POST request
      ({ username, level, count = 15 } = req.body);
    } else if (req.method === 'GET') {
      // Extract from query for GET request
      ({ username = 'anonymous', level = 'easy', count = 15 } = req.query);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const validLevels = ['easy', 'medium', 'hard'];

    // Validate inputs
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!level || !validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    // Find the user or create a new one
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username, questionsAnswered: [] });
      await user.save();
    }

    // Find questions that the user hasn't answered yet
    const questions = await Question.find({ 
      level, 
      id: { $nin: user.questionsAnswered } 
    }).limit(parseInt(count));

    // If we don't have enough questions, create some new ones
    if (questions.length < parseInt(count)) {
      // We'll use a fallback mechanism with pre-defined questions
      const fallbackQuestions = getFallbackQuestions(level, parseInt(count) - questions.length);
      
      // Save these new questions to the database
      if (fallbackQuestions.length > 0) {
        const questionDocs = fallbackQuestions.map(q => ({
          id: uuidv4(),
          question: q.question,
          correct_answer: q.correct_answer,
          incorrect_answers: q.incorrect_answers,
          level
        }));
        
        await Question.insertMany(questionDocs);
        
        // Add the new questions to our result
        const newQuestions = await Question.find({
          id: { $in: questionDocs.map(q => q.id) }
        });
        
        questions.push(...newQuestions);
      }
    }

    // Update user's answered questions
    if (questions.length > 0) {
      user.questionsAnswered.push(...questions.map(q => q.id));
      await user.save();
    }

    // Format the response
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers,
      level: q.level
    }));

    // Return the questions
    res.status(200).json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
}

// Fallback questions if database doesn't have enough
function getFallbackQuestions(level, count) {
  const easyQuestions = [
    {
      question: "What is the capital of France?",
      correct_answer: "Paris",
      incorrect_answers: ["London", "Berlin", "Madrid"]
    },
    {
      question: "Which planet is known as the Red Planet?",
      correct_answer: "Mars",
      incorrect_answers: ["Earth", "Jupiter", "Venus"]
    },
    {
      question: "What is the largest mammal?",
      correct_answer: "Blue Whale",
      incorrect_answers: ["Elephant", "Giraffe", "Polar Bear"]
    },
    {
      question: "Who painted the Mona Lisa?",
      correct_answer: "Leonardo da Vinci",
      incorrect_answers: ["Pablo Picasso", "Vincent van Gogh", "Michelangelo"]
    },
    {
      question: "What is the chemical symbol for gold?",
      correct_answer: "Au",
      incorrect_answers: ["Ag", "Fe", "Gd"]
    }
  ];
  
  const mediumQuestions = [
    {
      question: "Which element has the chemical symbol 'Na'?",
      correct_answer: "Sodium",
      incorrect_answers: ["Nitrogen", "Neon", "Nickel"]
    },
    {
      question: "Which scientist developed the theory of relativity?",
      correct_answer: "Albert Einstein",
      incorrect_answers: ["Isaac Newton", "Niels Bohr", "Galileo Galilei"]
    },
    {
      question: "What is the capital of Australia?",
      correct_answer: "Canberra",
      incorrect_answers: ["Sydney", "Melbourne", "Perth"]
    },
    {
      question: "In which year did World War II end?",
      correct_answer: "1945",
      incorrect_answers: ["1944", "1946", "1943"]
    },
    {
      question: "Who wrote 'To Kill a Mockingbird'?",
      correct_answer: "Harper Lee",
      incorrect_answers: ["John Steinbeck", "F. Scott Fitzgerald", "Ernest Hemingway"]
    }
  ];
  
  const hardQuestions = [
    {
      question: "What is the rarest blood type?",
      correct_answer: "AB-",
      incorrect_answers: ["O-", "B-", "A-"]
    },
    {
      question: "What is the most abundant element in the Earth's atmosphere?",
      correct_answer: "Nitrogen",
      incorrect_answers: ["Oxygen", "Carbon Dioxide", "Hydrogen"]
    },
    {
      question: "Who discovered penicillin?",
      correct_answer: "Alexander Fleming",
      incorrect_answers: ["Louis Pasteur", "Marie Curie", "Joseph Lister"]
    },
    {
      question: "What is the smallest prime number?",
      correct_answer: "2",
      incorrect_answers: ["1", "3", "0"]
    },
    {
      question: "What year was the first iPhone released?",
      correct_answer: "2007",
      incorrect_answers: ["2005", "2008", "2010"]
    }
  ];
  
  switch (level) {
    case 'easy':
      return easyQuestions.slice(0, count);
    case 'medium':
      return mediumQuestions.slice(0, count);
    case 'hard':
      return hardQuestions.slice(0, count);
    default:
      return [];
  }
}