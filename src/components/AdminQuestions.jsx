import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchQuestions();
  }, []);
  
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to fetch from API
      const response = await fetch('/api/admin/questions');
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
      
      // Fallback mock data for development
      setQuestions([
        {
          id: '1',
          category: 'easy',
          question: 'What is the capital of France?',
          options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
          correctAnswer: 'Paris',
          usageCount: 42,
          successRate: 78
        },
        {
          id: '2',
          category: 'medium',
          question: 'Which element has the chemical symbol "Au"?',
          options: ['Silver', 'Gold', 'Aluminum', 'Copper'],
          correctAnswer: 'Gold',
          usageCount: 35,
          successRate: 65
        },
        {
          id: '3',
          category: 'hard',
          question: 'In which year was the first successful powered airplane flight?',
          options: ['1903', '1910', '1897', '1915'],
          correctAnswer: '1903',
          usageCount: 28,
          successRate: 45
        },
        {
          id: '4',
          category: 'easy',
          question: 'What is the largest planet in our solar system?',
          options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 'Jupiter',
          usageCount: 38,
          successRate: 82
        },
        {
          id: '5',
          category: 'medium',
          question: 'Who painted "Starry Night"?',
          options: ['Pablo Picasso', 'Claude Monet', 'Vincent van Gogh', 'Leonardo da Vinci'],
          correctAnswer: 'Vincent van Gogh',
          usageCount: 31,
          successRate: 58
        },
        {
          id: '6',
          category: 'hard',
          question: 'What is the time complexity of a quick sort algorithm in the worst case?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
          correctAnswer: 'O(n²)',
          usageCount: 22,
          successRate: 38
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (question) => {
    setSelectedQuestion(question);
    setShowQuestionDetails(true);
  };
  
  const closeQuestionDetails = () => {
    setShowQuestionDetails(false);
  };
  
  const filteredQuestions = questions.filter(question => {
    let matchesFilter = filter === 'all' || question.category === filter;
    let matchesSearch = searchTerm === '' || 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      question.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });
  
  const getDifficultyBadgeClass = (category) => {
    switch(category) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader />
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    );
  }
  
  if (error && questions.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
        <h3 className="text-lg font-medium">Error loading questions</h3>
        <p className="mt-2">{error}</p>
        <button 
          onClick={fetchQuestions}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Question Management</h2>
        <div>
          <button 
            onClick={fetchQuestions}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Refresh
          </button>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => alert('This functionality would be implemented in a full version')}
          >
            Add Question
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p className="font-medium">Warning: Showing mock data</p>
          <p className="text-sm mt-1">API Error: {error}</p>
        </div>
      )}
      
      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('easy')}
            className={`px-4 py-2 rounded ${filter === 'easy' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            Easy
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
          >
            Medium
          </button>
          <button
            onClick={() => setFilter('hard')}
            className={`px-4 py-2 rounded ${filter === 'hard' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            Hard
          </button>
        </div>
        
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Questions Table */}
      {filteredQuestions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question, index) => (
                <motion.tr 
                  key={question.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-1" title={question.question}>
                      {question.question}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeClass(question.category)}`}>
                      {question.category?.charAt(0).toUpperCase() + question.category?.slice(1) || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{question.usageCount || 0} times</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            (question.successRate || 0) > 70 ? 'bg-green-600' : 
                            (question.successRate || 0) > 40 ? 'bg-yellow-400' : 'bg-red-600'
                          }`}
                          style={{ width: `${question.successRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{question.successRate || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(question)} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => alert(`Would delete question: ${question.id}`)}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">No questions found matching the filter criteria</p>
        </div>
      )}
      
      {/* Question Details Modal */}
      {showQuestionDetails && selectedQuestion && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900 mr-3">
                  Question Details
                </h3>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyBadgeClass(selectedQuestion.category)}`}>
                  {selectedQuestion.category?.charAt(0).toUpperCase() + selectedQuestion.category?.slice(1) || 'Unknown'}
                </span>
              </div>
              <button 
                onClick={closeQuestionDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Question</p>
                <p className="font-medium text-lg mt-1">{selectedQuestion.question}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Options</p>
                <div className="space-y-2">
                  {selectedQuestion.options?.map((option, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-md ${
                        option === selectedQuestion.correctAnswer 
                          ? 'bg-green-100 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        {option === selectedQuestion.correctAnswer && (
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Usage Count</p>
                  <p className="font-medium">{selectedQuestion.usageCount || 0} times</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="font-medium">{selectedQuestion.successRate || 0}%</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    closeQuestionDetails();
                    alert(`Would open edit form for question: ${selectedQuestion.id}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={closeQuestionDetails}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminQuestions;