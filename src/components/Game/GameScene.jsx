import React from 'react';
import { Environment as DreiEnvironment, ContactShadows, Sky, Bloom, EffectComposer } from '@react-three/drei';
import Player from './Player';
import GameEnvironment from './Environment';

export default function GameScene() {
  return (
    <>
      {/* Lighting and Environment */}
      <ambientLight intensity={0.2} />
      <directionalLight 
        castShadow 
        position={[10, 20, 10]} 
        intensity={1.5} 
        shadow-mapSize={[2048, 2048]} 
      />
      
      {/* Dramatic Sky */}
      <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      
      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
      </EffectComposer>

      {/* Level Geometry (Ground, Obstacles) */}
      <GameEnvironment />

      {/* Characters */}
      <Player position={[0, 5, 0]} color="var(--primary-color)" />
      
      {/* Boss Placeholder */}
      <mesh position={[0, 1, -10]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#5b00ff" emissive="#5b00ff" emissiveIntensity={0.5} />
      </mesh>
    </>
  );
}
