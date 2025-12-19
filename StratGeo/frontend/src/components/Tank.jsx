import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Tank({ position, color, onClick, isSelected }) {
  const ref = useRef();
  const { scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const downVector = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, position[0], 0.1);
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, position[2], 0.1);

      const rayOrigin = new THREE.Vector3(ref.current.position.x, 50, ref.current.position.z);
      raycaster.set(rayOrigin, downVector);
      const ground = scene.getObjectByName('ground');
      if (ground) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
          // Adjusted height for bigger tank scale
          ref.current.position.y = intersects[0].point.y + 1.0; 
        }
      }
    }
  });

  const tankColor = color === 'blue' ? '#4a6b3a' : '#8b4513';

  // SCALE=2: Makes the tank huge and visible
  return (
    <group position={position} onClick={onClick} ref={ref} scale={[2, 2, 2]}>
      
      {/* BEACON */}
      <mesh position={[0, 15, 0]}>
         <cylinderGeometry args={[0.03, 0.03, 30, 8]} />
         <meshBasicMaterial 
           color={color === 'blue' ? '#00ffff' : '#ff0000'} 
           transparent opacity={0.6} depthTest={false} 
         />
      </mesh>

      {/* SELECTION RING */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.6, 32]} />
          <meshBasicMaterial color="#00ff00" toneMapped={false} depthTest={false} />
        </mesh>
      )}

      {/* TANK MODEL */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 1.8]} />
        <meshStandardMaterial color={tankColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.65, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color={tankColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.7, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.65, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.4, 1.7]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.65, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.4, 1.7]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}
