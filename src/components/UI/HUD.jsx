import React from 'react';
import { motion } from 'framer-motion';

export default function HUD({ playerHealth = 100, playerChakra = 100, bossHealth = 100 }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8"
    >
      {/* Top HUD */}
      <div className="flex justify-between w-full">
        
        {/* Player Status (Left) */}
        <div className="glass-panel p-4 w-[400px] pointer-events-auto rounded-l-none border-l-0">
          <h2 className="text-xl font-bold mb-2 drop-shadow-md">UZUMAKI NARUTO</h2>
          
          {/* Health Bar */}
          <div className="w-full h-5 bg-black/50 border border-white/20 rounded-full overflow-hidden mb-2 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 to-naruto shadow-[0_0_10px_rgba(255,94,0,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${playerHealth}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Chakra Bar */}
          <div className="w-full h-3 bg-black/50 border border-white/20 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(0,187,255,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${playerChakra}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Boss Status (Right) */}
        <div className="glass-panel p-4 w-[400px] pointer-events-auto text-right rounded-r-none border-r-0">
          <h2 className="text-xl font-bold mb-2 text-purple-300 drop-shadow-md">UCHIHA MADARA</h2>
          
          <div className="w-full h-5 bg-black/50 border border-white/20 rounded-full overflow-hidden mb-2 shadow-inner flex justify-end">
            <motion.div 
              className="h-full bg-gradient-to-l from-purple-800 to-madara shadow-[0_0_10px_rgba(91,0,255,0.5)] origin-right"
              initial={{ width: 0 }}
              animate={{ width: `${bossHealth}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="glass-panel px-6 py-3 rounded-full flex gap-6 w-fit pointer-events-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="px-2 py-1 bg-white/10 border border-white/30 rounded text-white font-mono">W A S D</span> Move
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="px-2 py-1 bg-white/10 border border-white/30 rounded text-white font-mono">SPACE</span> Jump
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="px-2 py-1 bg-white/10 border border-white/30 rounded text-white font-mono">SHIFT</span> Dash
        </div>
      </div>
    </motion.div>
  );
}
