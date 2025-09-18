import React from 'react';
import { motion } from 'framer-motion';

const Help = ({ onBack }) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Game rules and help info
  const rulesContent = [
    {
      title: "Game Rules",
      icon: "📜",
      content: "Answer 15 questions with increasing difficulty. One wrong answer ends the game!"
    },
    {
      title: "Time Limits",
      icon: "⏱️",
      content: [
        "Questions 1-3: 20 seconds",
        "Questions 4-9: 30 seconds",
        "Questions 10-15: 45 seconds"
      ]
    },
    {
      title: "Prize Structure",
      icon: "💰",
      content: [
        "Q1: $25,000",
        "Q2: $50,000",
        "Q3: $100,000",
        "Q4: $200,000",
        "Q5: $400,000",
        "Q6: $800,000",
        "Q7: $1,600,000",
        "Q8: $3,200,000",
        "Q9: $6,400,000",
        "Q10: $12,800,000",
        "Q11: $25,600,000",
        "Q12: $51,200,000",
        "Q13: $102,400,000",
        "Q14: $204,800,000",
        "Q15: $700,000,000"
      ]
    },
    {
      title: "How to Play",
      icon: "🎮",
      content: [
        "Start the game from the main menu",
        "Read each question carefully",
        "Select the answer you believe is correct",
        "Answer before time runs out",
        "With each correct answer, your prize money increases",
        "If you answer incorrectly, the game ends"
      ]
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.img 
            src="/assets/images/QuizTime.png" 
            alt="QuizTime Logo" 
            className="h-24 w-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />
          
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Help
          </motion.h2>
          <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
        </div>

        <motion.div 
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {rulesContent.map((section, index) => (
            <motion.div 
              key={`section-${index}`}
              variants={item}
              className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{section.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
              </div>
              
              {Array.isArray(section.content) ? (
                <ul className="list-disc pl-8 space-y-1">
                  {section.content.map((item, idx) => (
                    <li key={`item-${idx}`} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">{section.content}</p>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-purple-700"
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;
