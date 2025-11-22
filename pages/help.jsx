import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useApp } from '../src/context/app-context';
import withAuth from '../src/utils/withAuth';
import Layout from '../src/components/layout';

// Back Arrow Icon
const BackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

const Help = () => {
  const router = useRouter();
  const { playSound } = useApp();

  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: 'url(/assets/images/b2.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 0, 130, 0.7)', // Purple overlay
    zIndex: 1
  };

  return (
    <Layout title="Help - QuizTime">
      <div style={containerStyle}>
        <div style={overlayStyle}></div>
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 2rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl space-y-6"
          >
            {/* Header */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Help & Guide</h1>
              <p className="text-center text-gray-600">Everything you need to know about QuizTime</p>
            </motion.div>

            {/* QZs Currency Section */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Quiz Zens (QZs) Currency
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Quiz Zens (QZs)</strong> is our exclusive in-game currency system:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Singular:</strong> QZ 1 (for single unit)</li>
                  <li><strong>Plural:</strong> QZs 25,000 (for multiple units)</li>
                  <li><strong>Prize Range:</strong> From QZs 25,000 to QZs 700,000,000</li>
                  <li><strong>Format:</strong> Currency symbol appears before the number</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Tip:</strong> The ultimate goal is to reach the maximum prize of QZs 700,000,000 by answering all 15 questions correctly!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* How to Play */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎮</span>
                How to Play
              </h3>
              <div className="space-y-3 text-gray-700">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Select 2 lifelines before starting the game</li>
                  <li>Answer 15 multiple-choice questions correctly</li>
                  <li>Each question has a 20-second timer</li>
                  <li>Click on your chosen answer to lock it in</li>
                  <li>Prize money increases with each correct answer</li>
                  <li>One wrong answer ends the game (unless you have Double Chance)</li>
                </ol>
              </div>
            </motion.div>

            {/* Lifelines */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🆘</span>
                Lifelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800">50-50</h4>
                  <p className="text-sm text-gray-600">Removes 2 incorrect answer options</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800">Pause Timer</h4>
                  <p className="text-sm text-gray-600">Stops the countdown timer</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800">Skip</h4>
                  <p className="text-sm text-gray-600">Skip current question (deducts prize money)</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800">Change Question</h4>
                  <p className="text-sm text-gray-600">Replace current question with a new one</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800">Double Chance</h4>
                  <p className="text-sm text-gray-600">Get a second attempt if you answer incorrectly</p>
                </div>
              </div>
            </motion.div>

            {/* Back Button */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={() => {
                  playSound('click');
                  router.push('/menu');
                }}
                className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 max-w-xs mx-auto"
                style={{
                  background: 'linear-gradient(to right, #EAB308, #F59E0B)',
                  backgroundImage: 'linear-gradient(to right, #EAB308, #F59E0B)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  style: {
                    background: 'linear-gradient(to right, #CA8A04, #D97706)',
                    backgroundImage: 'linear-gradient(to right, #CA8A04, #D97706)'
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Help);
