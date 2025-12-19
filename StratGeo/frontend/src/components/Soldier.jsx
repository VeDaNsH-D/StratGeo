import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Soldier({ position, color, onClick, isSelected }) {
  const ref = useRef();
  const { scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const downVector = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, position[0], 0.05);
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, position[2], 0.05);

      const rayOrigin = new THREE.Vector3(ref.current.position.x, 50, ref.current.position.z);
      raycaster.set(rayOrigin, downVector);
      const ground = scene.getObjectByName('ground');
      if (ground) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
          ref.current.position.y = intersects[0].point.y + 0.8;
        }
      }
    }
  });

  // SCALE=2.5: Makes soldiers clearly visible against mountains
  return (
    <group position={position} onClick={onClick} ref={ref} scale={[2.5, 2.5, 2.5]}>
      {isSelected && (
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
           <coneGeometry args={[0.2, 0.5, 4]} />
           <meshBasicMaterial color="#00ff00" rotation={[Math.PI, 0, 0]} depthTest={false} />
        </mesh>
      )}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshStandardMaterial color={color === 'blue' ? '#4a6b3a' : '#8b4513'} />
      </mesh>
      <mesh position={[0.1, 0.6, 0.2]} rotation={[Math.PI/3, 0, 0]}>
         <boxGeometry args={[0.05, 0.6, 0.05]} />
         <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}
