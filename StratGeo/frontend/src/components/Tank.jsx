import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Tank({ position, color, onClick, isSelected }) {
  const ref = useRef();

  // Subtle hover animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05 + 0.2; // Hover effect
    }
  });

  return (
    <group position={position} onClick={onClick} ref={ref}>
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.9, 32]} />
          <meshBasicMaterial color="#0f0" />
        </mesh>
      )}

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.4, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Turret */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0.4, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}
