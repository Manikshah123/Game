import React from 'react';
import { motion } from 'framer-motion';

export default function LandingPage({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50 overflow-hidden"
    >
      {/* Background Anime Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
      
      {/* Split Screen Concept */}
      <div className="absolute inset-0 flex">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-1/2 h-full bg-orange-900/10 border-r border-orange-500/20"
        >
          {/* Naruto Side placeholder */}
        </motion.div>
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-1/2 h-full bg-purple-900/10 border-l border-purple-500/20"
        >
          {/* Madara Side placeholder */}
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-naruto to-madara text-glow-orange mb-2">
            SHINOBI WAR
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 tracking-[0.5em] uppercase font-light">
            Ultimate Battle
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 94, 0, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          onClick={onStart}
          className="mt-12 px-8 py-4 border border-naruto/50 bg-naruto/10 text-white font-orbitron text-xl uppercase tracking-widest rounded transition-colors hover:bg-naruto/20 cursor-pointer"
        >
          Start Game
        </motion.button>
      </div>
    </motion.div>
  );
}
