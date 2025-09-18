import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useApp } from '../context/app-context';

const Layout = ({ children, title = 'QuizTime' }) => {
  const { theme } = useApp();
  
  // Define theme-specific background classes
  const getBackgroundClass = () => {
    switch(theme) {
      case 'dark':
        return 'min-h-screen bg-gradient-to-b from-gray-900 to-black';
      case 'light':
        return 'min-h-screen bg-gradient-to-b from-blue-100 to-purple-100';
      default:
        return 'min-h-screen bg-gradient-to-b from-blue-900 to-purple-900';
    }
  };
  
  return (
    <>
      <Head>
        <title>{title} | Win $700,000,000</title>
        <meta name="description" content="QuizTime - An exciting quiz game where you can win up to $700,000,000!" />
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
