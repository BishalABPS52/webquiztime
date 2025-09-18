import '../src/globals.css';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../src/components/layout';
import { AppProvider } from '../src/context/app-context';
import { GameProvider } from '../src/context/game-context';

function MyApp({ Component, pageProps, router }) {
  useEffect(() => {
    // Import fonts or other global resources
    const loadFonts = async () => {
      try {
        await document.fonts.load('1em KnightWarrior');
        await document.fonts.load('1em CaviarDreams_Bold');
      } catch (error) {
        console.error('Failed to load fonts:', error);
      }
    };
    
    loadFonts();
  }, []);
  
  return (
    <AppProvider>
      <GameProvider>
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.route}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </Layout>
      </GameProvider>
    </AppProvider>
  );
}

export default MyApp;
