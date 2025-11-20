import '../src/globals.css';
import '../src/styles/themes.css';
import '../src/styles/toggle-switch.css';
import '../styles/quiztime.css';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../src/components/layout';
import { AppProvider } from '../src/context/app-context';
import { GameProvider } from '../src/context/game-context';
import { LoadingProvider } from '../src/context/loading-context';

function MyApp({ Component, pageProps, router }) {
  useEffect(() => {
    // Import fonts or other global resources
    const loadFonts = async () => {
      try {
        await document.fonts.load('1em CaveatBrush');
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
        <LoadingProvider>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.route}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </motion.div>
          </AnimatePresence>
        </LoadingProvider>
      </GameProvider>
    </AppProvider>
  );
}

export default MyApp;
