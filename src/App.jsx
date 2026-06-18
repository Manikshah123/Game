import React, { useState, Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Loader } from '@react-three/drei';
import { useControls } from 'leva';
import { AnimatePresence, motion } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import GameArena from './scenes/GameArena';
import HUD from './components/UI/HUD';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'dash', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'punch', keys: ['KeyE'] },
  { name: 'slash', keys: ['KeyR'] },
  { name: 'smash', keys: ['KeyF'] },
  { name: 'katana', keys: ['KeyP'] },
];

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing'
  const [bossHealth, setBossHealth] = useState(100);
  const [isRespawning, setIsRespawning] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Used to force-reset the entire arena

  // Background Music Logic
  const { musicEnabled } = useControls('General Settings', {
    musicEnabled: true
  });

  const [bgMusic] = useState(() => {
    const audio = new Audio('/backmus.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    return audio;
  });

  useEffect(() => {
    if (gameState === 'playing' && musicEnabled) {
      bgMusic.play().catch(e => console.log("Audio playback failed:", e));
    } else {
      bgMusic.pause();
    }
    
    return () => bgMusic.pause();
  }, [gameState, musicEnabled, bgMusic]);

  const handleFall = useCallback(() => {
    if (isRespawning) return;
    setIsRespawning(true);
    
    // Animation sequence
    setTimeout(() => {
      setGameKey(prev => prev + 1);
      setBossHealth(100);
      setIsRespawning(false);
    }, 1500); // 1.5s total respawn time
  }, [isRespawning]);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen bg-black overflow-hidden font-inter text-white">
        <AnimatePresence>
          {gameState === 'menu' && (
            <LandingPage key="landing" onStart={() => setGameState('playing')} />
          )}
        </AnimatePresence>

        {gameState === 'playing' && (
          <>
            <HUD playerHealth={100} playerChakra={100} bossHealth={bossHealth} />

            <KeyboardControls map={keyboardMap}>
              <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <Suspense fallback={null}>
                  <Physics key={gameKey} gravity={[0, -30, 0]}>
                    <GameArena 
                      key={gameKey}
                      setBossHealth={setBossHealth} 
                      bossHealth={bossHealth} 
                      onFall={handleFall}
                    />
                  </Physics>
                </Suspense>
              </Canvas>
              <Loader 
                containerStyles={{ background: '#050505' }}
                innerStyles={{ background: 'transparent', width: '300px', border: '1px solid rgba(255, 94, 0, 0.3)' }}
                barStyles={{ background: 'linear-gradient(90deg, #ff0000, #ff5e00)' }}
                dataInterpolation={(p) => `LOADING ASSETS ${p.toFixed(0)}%`}
                dataStyles={{ fontFamily: 'Orbitron', color: '#ff5e00', textShadow: '0 0 10px rgba(255, 94, 0, 0.5)' }}
              />
            </KeyboardControls>

            {/* Death/Respawn Animation Overlay */}
            <AnimatePresence>
              {isRespawning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
                >
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-bold text-red-600 uppercase tracking-[0.5em] font-orbitron"
                    style={{ textShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}
                  >
                    Wasted
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-gray-400 uppercase tracking-widest text-sm"
                  >
                    Resetting Timeline...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
