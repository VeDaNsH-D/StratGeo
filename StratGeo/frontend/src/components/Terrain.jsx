import React from 'react';
import { Grid } from '@react-three/drei';

export function Terrain({ onGroundClick }) {
  // Generate fake "mountains" using random blocks
  const obstacles = React.useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      x: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
      h: Math.random() * 2 + 1
    }));
  }, []);

  return (
    <group>
      {/* Infinite Grid Floor */}
      <Grid 
        infiniteGrid 
        fadeDistance={40} 
        sectionColor="#00ff00" 
        cellColor="#003300" 
        position={[0, -0.01, 0]}
      />
      
      {/* Invisible Plane to catch clicks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} onClick={onGroundClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Digital Mountains (Obstacles) */}
      {obstacles.map((obs, i) => (
        <mesh key={i} position={[obs.x, obs.h / 2, obs.z]}>
          <boxGeometry args={[1, obs.h, 1]} />
          <meshStandardMaterial color="#1a2b1a" wireframe={true} />
          <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.99, obs.h-0.01, 0.99]} />
             <meshBasicMaterial color="black" />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}
