/**
 * Mock data service for QuizTime application
 * This provides fallback data when the backend API is unavailable
 */

const mockQuestions = {
  easy: [
    {
      id: 'e1',
      question: 'What is the capital of France?',
      correct_answer: 'Paris',
      incorrect_answers: ['London', 'Berlin', 'Madrid']
    },
    {
      id: 'e2',
      question: 'Which planet is known as the Red Planet?',
      correct_answer: 'Mars',
      incorrect_answers: ['Venus', 'Jupiter', 'Saturn']
    },
    {
      id: 'e3',
      question: 'What is the largest ocean on Earth?',
      correct_answer: 'Pacific Ocean',
      incorrect_answers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean']
    },
    {
      id: 'e4',
      question: 'Which is the largest mammal in the world?',
      correct_answer: 'Blue Whale',
      incorrect_answers: ['Elephant', 'Giraffe', 'Hippopotamus']
    },
    {
      id: 'e5',
      question: 'Which year did World War II end?',
      correct_answer: '1945',
      incorrect_answers: ['1939', '1942', '1947']
    },
    {
      id: 'e6',
      question: 'What is the chemical symbol for gold?',
      correct_answer: 'Au',
      incorrect_answers: ['Ag', 'Fe', 'Cu']
    },
    {
      id: 'e7',
      question: 'How many sides does a hexagon have?',
      correct_answer: '6',
      incorrect_answers: ['5', '7', '8']
    },
    {
      id: 'e8',
      question: 'Which instrument has 88 keys?',
      correct_answer: 'Piano',
      incorrect_answers: ['Guitar', 'Violin', 'Flute']
    },
    {
      id: 'e9',
      question: 'What is the main ingredient in guacamole?',
      correct_answer: 'Avocado',
      incorrect_answers: ['Tomato', 'Onion', 'Lime']
    },
    {
      id: 'e10',
      question: 'Who wrote "Romeo and Juliet"?',
      correct_answer: 'William Shakespeare',
      incorrect_answers: ['Charles Dickens', 'Jane Austen', 'Mark Twain']
    }
  ],
  medium: [
    {
      id: 'm1',
      question: 'Which element has the chemical symbol "Na"?',
      correct_answer: 'Sodium',
      incorrect_answers: ['Neon', 'Nickel', 'Nitrogen']
    },
    {
      id: 'm2',
      question: 'What is the capital of Australia?',
      correct_answer: 'Canberra',
      incorrect_answers: ['Sydney', 'Melbourne', 'Perth']
    },
    {
      id: 'm3',
      question: 'Who painted "The Starry Night"?',
      correct_answer: 'Vincent van Gogh',
      incorrect_answers: ['Pablo Picasso', 'Claude Monet', 'Leonardo da Vinci']
    },
    {
      id: 'm4',
      question: 'In which year was the first iPhone released?',
      correct_answer: '2007',
      incorrect_answers: ['2005', '2008', '2010']
    },
    {
      id: 'm5',
      question: 'What is the largest bone in the human body?',
      correct_answer: 'Femur',
      incorrect_answers: ['Tibia', 'Humerus', 'Skull']
    },
    {
      id: 'm6',
      question: 'Which country is known as the Land of the Rising Sun?',
      correct_answer: 'Japan',
      incorrect_answers: ['China', 'Thailand', 'Vietnam']
    },
    {
      id: 'm7',
      question: 'What is the SI unit of force?',
      correct_answer: 'Newton',
      incorrect_answers: ['Watt', 'Joule', 'Pascal']
    },
    {
      id: 'm8',
      question: 'Who discovered penicillin?',
      correct_answer: 'Alexander Fleming',
      incorrect_answers: ['Marie Curie', 'Louis Pasteur', 'Robert Koch']
    }
  ],
  hard: [
    {
      id: 'h1',
      question: 'What is the most abundant element in the universe?',
      correct_answer: 'Hydrogen',
      incorrect_answers: ['Helium', 'Oxygen', 'Carbon']
    },
    {
      id: 'h2',
      question: 'Who formulated the theory of relativity?',
      correct_answer: 'Albert Einstein',
      incorrect_answers: ['Isaac Newton', 'Stephen Hawking', 'Niels Bohr']
    },
    {
      id: 'h3',
      question: 'What is the smallest prime number?',
      correct_answer: '2',
      incorrect_answers: ['1', '3', '0']
    },
    {
      id: 'h4',
      question: 'Which scientist discovered the structure of DNA?',
      correct_answer: 'Watson and Crick',
      incorrect_answers: ['Rosalind Franklin', 'Gregor Mendel', 'Louis Pasteur']
    },
    {
      id: 'h5',
      question: 'What is the capital of Brazil?',
      correct_answer: 'Brasília',
      incorrect_answers: ['Rio de Janeiro', 'São Paulo', 'Salvador']
    },
    {
      id: 'h6',
      question: 'In which year did the Chernobyl disaster occur?',
      correct_answer: '1986',
      incorrect_answers: ['1984', '1991', '1979']
    },
    {
      id: 'h7',
      question: 'Who wrote "War and Peace"?',
      correct_answer: 'Leo Tolstoy',
      incorrect_answers: ['Fyodor Dostoevsky', 'Anton Chekhov', 'Ivan Turgenev']
    },
    {
      id: 'h8',
      question: 'What is the hardest natural substance on Earth?',
      correct_answer: 'Diamond',
      incorrect_answers: ['Graphite', 'Quartz', 'Titanium']
    }
  ]
};

/**
 * Mock API service that mimics the behavior of the real API
 * Used as a fallback when the backend is unavailable
 */
class MockDataService {
  /**
   * Get questions from mock data
   * @param {string} level - Difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to return
   * @returns {Object} Object with questions array
   */
  static getQuestions(level = 'medium', count = 5) {
    // Get questions for the requested level, or default to medium if not found
    const questions = mockQuestions[level] || mockQuestions.medium;
    
    // Return a subset of questions based on count
    // If requested count is greater than available, return all available
    const returnCount = Math.min(count, questions.length);
    
    // Shuffle questions to get random set each time
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    
    return {
      success: true,
      questions: shuffled.slice(0, returnCount)
    };
  }
}

export default MockDataService;