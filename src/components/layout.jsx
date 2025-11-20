import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';

const Layout = ({ children, title = 'QuizTime' }) => {
  const { theme } = useApp();
  
  // Always use the default background class
  const getBackgroundClass = () => {
    // Default theme is always blue-purple gradient
    return 'min-h-screen bg-gradient-to-b from-blue-900 to-purple-900';
  };
  
  return (
    <>
      <Head>
        <title>QuizTime</title>
        <meta name="description" content="QuizTime - An exciting quiz game with amazing prizes!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/images/QuizTime.png" />
      </Head>

      <motion.main 
        className={getBackgroundClass()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </>
  );
};

export default Layout;
