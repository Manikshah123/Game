import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, Sparkles, useGLTF, useAnimations, useFBX, OrbitControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useControls } from 'leva';
import * as THREE from 'three';

const SPEED = 12;
const DASH_SPEED = 25;
const JUMP_FORCE = 15;

export default function Player({ position, setBossHealth, bossPosition, onFall }) {
  const rigidBody = useRef();
  const orbitRef = useRef();
  const [, getKeys] = useKeyboardControls();
  
  // 1. Load the 3D model from the public folder
  const fbx = useFBX('/naruto/static.fbx');
  const standFbx = useFBX('/naruto/animations/stand.fbx');
  const runFbx = useFBX('/naruto/animations/run.fbx');
  const punchFbx = useFBX('/naruto/animations/punch.fbx');
  const jumpUpFbx = useFBX('/naruto/animations/jumpUp.fbx');
  const slashFbx = useFBX('/naruto/animations/waveHello.fbx');
  const smashFbx = useFBX('/naruto/animations/jumpDown.fbx');
  const walkFbx = useFBX('/naruto/animations/walk.fbx');
  const walkLeftFbx = useFBX('/naruto/animations/walkLeft.fbx');
  const walkRightFbx = useFBX('/naruto/animations/walkRight.fbx');
  const strafeLeftFbx = useFBX('/naruto/animations/strafeLeft.fbx');
  const strafeRightFbx = useFBX('/naruto/animations/strafeRight.fbx');

  const animations = useMemo(() => {
    if (!standFbx || !runFbx || !punchFbx || !jumpUpFbx || !slashFbx || !smashFbx) return [];
    const idle = standFbx.animations[0].clone();
    idle.name = 'idle';
    const run = runFbx.animations[0].clone();
    run.name = 'run';
    const punch = punchFbx.animations[0].clone();
    punch.name = 'punch';
    const jump = jumpUpFbx.animations[0].clone();
    jump.name = 'jump';
    const slash = slashFbx.animations[0].clone();
    slash.name = 'slash';
    const smash = smashFbx.animations[0].clone();
    smash.name = 'smash';
    const fall = smashFbx.animations[0].clone();
    fall.name = 'fall';
    const walk = walkFbx.animations[0].clone();
    walk.name = 'walk';
    const walkLeft = walkLeftFbx.animations[0].clone();
    walkLeft.name = 'walkLeft';
    const walkRight = walkRightFbx.animations[0].clone();
    walkRight.name = 'walkRight';
    const strafeLeft = strafeLeftFbx.animations[0].clone();
    strafeLeft.name = 'strafeLeft';
    const strafeRight = strafeRightFbx.animations[0].clone();
    strafeRight.name = 'strafeRight';

    return [idle, run, punch, jump, slash, smash, fall, walk, walkLeft, walkRight, strafeLeft, strafeRight];
  }, [standFbx, runFbx, punchFbx, jumpUpFbx, slashFbx, smashFbx, walkFbx, walkLeftFbx, walkRightFbx, strafeLeftFbx, strafeRightFbx]);

  const group = useRef();
  const katanaRef = useRef();
  const { actions } = useAnimations(animations, group);
  const currentAction = useRef('idle');

  // Bone Attachment Logic
  useEffect(() => {
    if (fbx && katanaRef.current) {
      // Look for the hand bone
      let hand = null;
      fbx.traverse((child) => {
        if (child.isBone && (child.name.toLowerCase().includes('hand') && child.name.toLowerCase().includes('right'))) {
          hand = child;
        }
      });

      if (hand) {
        hand.add(katanaRef.current);
        // Reset local transform for the bone
        katanaRef.current.position.set(0, 10, 0); // FBX scales are often 100x, so 10 might be needed
        katanaRef.current.rotation.set(Math.PI / 2, 0, 0);
      }
    }
  }, [fbx]);

  useEffect(() => {
    if (actions['idle']) actions['idle'].play();
  }, [actions]);
  
  
  const [isDashing, setIsDashing] = useState(false);
  const [showKatana, setShowKatana] = useState(false);
  const [attackState, setAttackState] = useState({ isAttacking: false, type: null }); // type: 'punch' | 'slash'
  
  const dashTimer = useRef(0);
  const attackTimer = useRef(0);
  const lastAttackKeys = useRef({ punch: false, slash: false, smash: false, katana: false });

  useFrame((state) => {
    if (!rigidBody.current) return;

    const keys = getKeys();
    
    // Check for "Just Pressed" keys to prevent infinite looping when holding down buttons
    const punchPressed = keys.punch && !lastAttackKeys.current.punch;
    const slashPressed = keys.slash && !lastAttackKeys.current.slash;
    const smashPressed = keys.smash && !lastAttackKeys.current.smash;
    const katanaPressed = keys.katana && !lastAttackKeys.current.katana;
    
    // Store for next frame
    lastAttackKeys.current = { 
      punch: !!keys.punch, 
      slash: !!keys.slash, 
      smash: !!keys.smash,
      katana: !!keys.katana
    };

    // Toggle Katana
    if (katanaPressed) {
      setShowKatana(prev => !prev);
    }

    // Movement Logic
    const velocity = rigidBody.current.linvel();
    const currentSpeed = isDashing ? DASH_SPEED : SPEED;

    // Camera-relative movement
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(state.camera.up, cameraDirection).normalize();

    const direction = new THREE.Vector3();
    const forwardMovement = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
    const rightMovement = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);

    direction.addVectors(
      cameraDirection.multiplyScalar(forwardMovement),
      cameraRight.multiplyScalar(rightMovement)
    ).normalize().multiplyScalar(currentSpeed);
    
    // Direct velocity application for snappy, "free" movement
    rigidBody.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

    // Rotate character mesh to face movement direction smoothly
    if ((keys.forward || keys.backward || keys.left || keys.right) && group.current) {
      const angle = Math.atan2(direction.x, direction.z);
      const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      group.current.quaternion.slerp(targetRotation, 0.5);
    }

    // Jump
    if (keys.jump && Math.abs(velocity.y) < 0.1) {
      rigidBody.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
    }

    // Dash mechanic
    if (keys.dash && !isDashing && dashTimer.current <= 0) {
      setIsDashing(true);
      dashTimer.current = 1.0; // 1 second cooldown
      setTimeout(() => setIsDashing(false), 200); // 200ms dash duration
    }

    if (dashTimer.current > 0) {
      dashTimer.current -= state.clock.getDelta();
    }

    // Combat Logic
    if (!attackState.isAttacking && (punchPressed || slashPressed || smashPressed)) {
      let type = 'punch';
      let damage = 10;
      
      // Damage multiplier if katana is drawn
      const katanaMultiplier = showKatana ? 2.5 : 1;

      if (slashPressed) {
        type = 'slash';
        damage = 20 * katanaMultiplier;
      } else if (smashPressed) {
        type = 'smash';
        damage = 35 * katanaMultiplier;
      } else if (punchPressed) {
        damage = 10 * katanaMultiplier; // Katana pommel strike or hilt hit
      }

      setAttackState({ isAttacking: true, type });
      attackTimer.current = 0.5; // 0.5 seconds attack duration
      
      // Calculate Hit detection (simple distance check)
      const dist = rigidBody.current.translation();
      const bPos = new THREE.Vector3(...(bossPosition || [0, 0, -10]));
      const pPos = new THREE.Vector3(dist.x, dist.y, dist.z);
      
      // Reach is slightly higher with a katana
      const reach = showKatana ? 7 : 5;
      
      if (pPos.distanceTo(bPos) < reach) {
        // We scored a hit!
        if (setBossHealth) {
          setBossHealth(prev => Math.max(0, prev - damage));
        }
      }
    }

    if (attackState.isAttacking) {
      attackTimer.current -= state.clock.getDelta();
      if (attackTimer.current <= 0) {
        setAttackState({ isAttacking: false, type: null });
      }
    }

    // Animation State Machine
    let nextAction = 'idle';
    if (attackState.isAttacking) {
      nextAction = attackState.type; // 'punch', 'slash', or 'smash'
    } else if (velocity.y < -1) {
      nextAction = 'fall';
    } else if (Math.abs(velocity.y) > 0.5) {
      nextAction = 'jump';
    } else if (currentSpeed > 0 && (keys.forward || keys.backward || keys.left || keys.right)) {
      nextAction = 'run';
    }

    if (currentAction.current !== nextAction && actions[nextAction]) {
      actions[currentAction.current]?.fadeOut(0.05);
      actions[nextAction].reset().fadeIn(0.05).play();
      currentAction.current = nextAction;
    }

    // Cinematic Camera Follow
    const playerPosition = rigidBody.current.translation();
    if (orbitRef.current) {
      // Snapping the target instantly prevents the camera from "zooming out" or drifting
      orbitRef.current.target.set(playerPosition.x, playerPosition.y + 1.5, playerPosition.z);
    }

    // Fall out of bounds detection & Cinematic Restart
    if (playerPosition.y < -150) {
      if (onFall) {
        onFall();
      } else {
        // Fallback teleport if no onFall prop provided
        rigidBody.current.setTranslation({ x: 0, y: 15, z: 0 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  });

  // Katana Position Debugger
  const { kX, kY, kZ, kRX, kRY, kRZ } = useControls('Katana Offset', {
    kX: { value: -0.3, min: -2, max: 2, step: 0.01 },
    kY: { value: 0.8, min: -2, max: 2, step: 0.01 },
    kZ: { value: 0.1, min: -2, max: 2, step: 0.01 },
    kRX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    kRY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    kRZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  });

  return (
    <>
      <OrbitControls 
        ref={orbitRef} 
        makeDefault 
        enablePan={false} 
        minDistance={2} 
        maxDistance={10} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        rotateSpeed={0.4} 
        zoomSpeed={0.8} 
      />
      
      <RigidBody ref={rigidBody} colliders={false} mass={1} type="dynamic" position={position} lockRotations>
      <CapsuleCollider args={[0.5, 0.5]} />

      {/* Combat Visuals: Sword (Slash) */}
      {attackState.isAttacking && attackState.type === 'slash' && (
        <mesh position={[1, 0, -1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 3, 0.5]} />
          <meshStandardMaterial 
            color={showKatana ? "#00ffff" : "#ffffff"} 
            metalness={0.9} 
            roughness={0.1} 
            emissive={showKatana ? "#00ffff" : "#00ffff"} 
            emissiveIntensity={showKatana ? 5 : 1} 
          />
        </mesh>
      )}

      {/* Combat Visuals: Fist (Punch) */}
      {attackState.isAttacking && attackState.type === 'punch' && (
        <mesh position={[0, 0.5, -1.5]} castShadow>
          {showKatana ? (
            <boxGeometry args={[0.05, 3, 0.5]} />
          ) : (
            <sphereGeometry args={[0.5, 16, 16]} />
          )}
          <meshStandardMaterial 
            color={showKatana ? "#00ffff" : "#ff0000"} 
            emissive={showKatana ? "#00ffff" : "#ff0000"} 
            emissiveIntensity={showKatana ? 5 : 2} 
          />
        </mesh>
      )}

      {/* Combat Visuals: Smash (Heavy) */}
      {attackState.isAttacking && attackState.type === 'smash' && (
        <mesh position={[0, -0.5, -2]} castShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Add your actual 3D model */}
      <group ref={group} position={[0, -0.9, 0]}>
        <primitive object={fbx} scale={0.01} castShadow />
        
        {/* Dynamic Katana Weapon - Bone Attached */}
        {showKatana && (
          <group ref={katanaRef} position={[kX, kY, kZ]} rotation={[kRX, kRY, kRZ]} scale={100}>
            {/* Blade */}
            <mesh castShadow>
              <boxGeometry args={[0.002, 0.12, 0.008]} />
              <meshStandardMaterial color="#e0e0e0" metalness={1} roughness={0.1} />
            </mesh>
            {/* Guard (Tsuba) */}
            <mesh position={[0, -0.06, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.002, 16]} />
              <meshStandardMaterial color="#222222" metalness={0.8} />
            </mesh>
            {/* Handle (Tsuka) */}
            <mesh position={[0, -0.08, 0]} castShadow>
              <boxGeometry args={[0.004, 0.04, 0.006]} />
              <meshStandardMaterial color="#880000" />
            </mesh>
          </group>
        )}
      </group>
      
      {/* Chakra Aura */}
      <Sparkles 
        count={isDashing ? 150 : 50} 
        scale={[1.5, 2, 1.5]} 
        size={isDashing ? 6 : 3} 
        speed={isDashing ? 2 : 0.5} 
        opacity={isDashing ? 1 : 0.5}
        color={showKatana ? "#00ffff" : "#ffaa00"} // Change aura color when katana is out
      />
      </RigidBody>
    </>
  );
}
