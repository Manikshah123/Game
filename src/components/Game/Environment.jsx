import React, { useEffect, useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF, Bvh } from '@react-three/drei';
import { useControls, button } from 'leva';

export default function GameEnvironment({ type = 'momus' }) {
  const modelPath = type === 'momus' ? '/momus-park-gltf/scene.gltf' : '/back2/scene.gltf';
  const { scene } = useGLTF(modelPath);
  const rbRef = useRef();

  const [settings, set] = useControls('Background Transform', () => ({
    scale: {
      value: type === 'momus' ? 1 : 50, // Larger scale for back2
      min: 0.1,
      max: 200,
      step: 0.1
    },
    positionX: { value: 0, min: -1000, max: 1000, step: 1 },
    positionY: {
      value: type === 'momus' ? -1 : -150, // Much lower for back2 to ensure player is on top
      min: -1000,
      max: 1000,
      step: 1
    },
    positionZ: { value: 0, min: -1000, max: 1000, step: 1 },
    physicsType: {
      value: type === 'momus' ? 'trimesh' : 'hull',
      options: ['trimesh', 'hull', 'ball', 'cuboid']
    },
    'Reset to Defaults': button(() => {
      set({
        scale: type === 'momus' ? 1 : 50,
        positionX: 0,
        positionY: type === 'momus' ? -1 : -150,
        positionZ: 0,
        physicsType: type === 'momus' ? 'trimesh' : 'hull'
      });
      setPhysicsKey(Date.now());
    }),
    'Rebuild Physics': button(() => {
      setPhysicsKey(Date.now());
    })
  }));

  const [physicsKey, setPhysicsKey] = React.useState(Date.now());

  const { scale, positionX, positionY, positionZ, physicsType } = settings;

  // Auto-shadows and optimization
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.matrixAutoUpdate = false;
          child.updateMatrix();
        }
      });
    }
  }, [scene]);

  return (
    <Bvh firstHitOnly>
      <RigidBody 
        key={`${modelPath}-${physicsKey}-${physicsType}`} 
        ref={rbRef}
        type="fixed" 
        colliders={physicsType}
      >
        <primitive 
          object={scene} 
          position={[positionX, positionY, positionZ]} 
          scale={scale} 
        />
      </RigidBody>
    </Bvh>
  );
}

useGLTF.preload('/momus-park-gltf/scene.gltf');
useGLTF.preload('/back2/scene.gltf');
