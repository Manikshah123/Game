import React from 'react';
import { Sparkles, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useControls } from 'leva';
import Player from '../components/Game/Player';
import GameEnvironment from '../components/Game/Environment';
import Boss from '../components/Game/Boss';

export default function GameArena({ setBossHealth, bossHealth, onFall }) {
  const { background, bloom, sparkles, highResShadows } = useControls('World Configuration', {
    background: {
      value: 'momus',
      options: ['momus', 'back2']
    },
    bloom: true,
    sparkles: true,
    highResShadows: false
  });

  const spawnPosition = background === 'momus' ? [0, 5, 0] : [0, 20, 0]; // Higher spawn for back2 just in case

  return (
    <>
      <color attach="background" args={[background === 'momus' ? '#020206' : '#050510']} />
      <fog attach="fog" args={[background === 'momus' ? '#020206' : '#050510', 10, 100]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight 
        castShadow 
        position={[10, 20, 10]} 
        intensity={0.5} 
        color={background === 'momus' ? "#8aa1ff" : "#ffaa88"}
        shadow-mapSize={highResShadows ? [2048, 2048] : [512, 512]} 
      />
      <pointLight position={[0, 5, -10]} intensity={5} color="#5b00ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset={background === 'momus' ? "city" : "night"} environmentIntensity={0.1} />
      
      {/* Environmental Dust */}
      {sparkles && <Sparkles count={500} scale={[100, 20, 100]} size={2} speed={0.2} opacity={0.3} color="#ffffff" />}

      {/* Cinematic Post Processing */}
      {bloom && (
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.5} />
        </EffectComposer>
      )}

      <GameEnvironment type={background} />

      <Player 
        position={spawnPosition} 
        setBossHealth={setBossHealth} 
        bossPosition={[0, 1, -10]} 
        onFall={onFall}
      />
      
      {/* Boss Instance */}
      <Boss position={[0, 1, -10]} bossHealth={bossHealth} />
    </>
  );
}
