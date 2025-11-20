import React from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

/**
 * Loading screen component shown while questions are being loaded
 */
const LoadingScreen = ({ message = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg p-8 bg-white rounded-xl shadow-xl text-center"
    >
      {message && <h2 className="text-2xl font-bold text-blue-600 mb-6">{message}</h2>}
      
      <Loader />
    </motion.div>
  );
};

export default LoadingScreen;