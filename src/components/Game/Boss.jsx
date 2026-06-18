import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Sparkles } from '@react-three/drei';

export default function Boss({ position, bossHealth }) {
  const bossRef = useRef();
  const materialRef = useRef();
  const prevHealth = useRef(bossHealth);

  useEffect(() => {
    if (bossHealth < prevHealth.current) {
      if (materialRef.current) {
        materialRef.current.color.setHex(0xff0000);
        setTimeout(() => {
          if (materialRef.current) materialRef.current.color.setHex(0x1a0b2e);
        }, 200);
      }
    }
    prevHealth.current = bossHealth;
  }, [bossHealth]);

  useFrame(({ clock }) => {
    if (bossRef.current) {
      // Basic idle floating animation for the boss
      const yPos = Math.sin(clock.getElapsedTime() * 2) * 0.1;
      const currentTranslation = bossRef.current.translation();
      bossRef.current.setTranslation({
        x: currentTranslation.x,
        y: position[1] + yPos,
        z: currentTranslation.z
      }, true);
    }
  });

  return (
    <RigidBody ref={bossRef} colliders={false} type="fixed" position={position} lockRotations>
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial ref={materialRef} color="#1a0b2e" emissive="#5b00ff" emissiveIntensity={bossHealth <= 0 ? 0 : 0.8} />
      </mesh>

      {/* Dark Chakra Aura */}
      <Sparkles 
        count={80} 
        scale={[1.8, 2.5, 1.8]} 
        size={5} 
        speed={1} 
        opacity={0.8}
        color="#7000ff" 
      />
    </RigidBody>
  );
}
