import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useApp } from '../src/context/app-context';
import withAuth from '../src/utils/withAuth';

// Back Arrow Icon
const BackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

const Help = () => {
  const router = useRouter();
  const { playSound } = useApp();

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
  const helpSections = [
    {
      title: "How to Play",
      content: [
        "Answer 15 questions correctly to win the grand prize",
        "Each question has 4 multiple choice answers",
        "You have 20 seconds to answer each question",
        "Select your answer before time runs out",
        "Wrong answer ends the game - choose wisely!",
        "Your prize money increases with each correct answer"
      ]
    },
    {
      title: "Game Tips",
      content: [
        "Read each question and all options carefully",
        "Use your knowledge and logical reasoning",
        "Don't rush - you have 20 seconds to think",
        "Stay calm and confident in your answers",
        "Practice makes perfect - keep playing!"
      ]
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 px-4 py-6 md:px-8" 
         style={{
           backgroundImage: 'url(/assets/images/b2.jpg)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 md:space-y-8 border border-gray-100"
        >
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={() => {
                playSound('click');
                router.push('/menu');
              }}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-yellow-600 transition-colors duration-200"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <BackIcon />
              <span className="ml-2 font-medium">Back to Menu</span>
            </motion.button>
            
            <motion.h1 
              className="text-7xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Help
            </motion.h1>
            <div className="w-24"></div>
          </div>



          {/* Help Sections Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {helpSections.map((section, index) => (
              <motion.div 
                key={`section-${index}`}
                variants={item}
                className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                </div>
                
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={`item-${idx}`} className="flex items-start">
                      <span className="text-yellow-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>


        </motion.div>
    </div>
  );
};

export default withAuth(Help);
