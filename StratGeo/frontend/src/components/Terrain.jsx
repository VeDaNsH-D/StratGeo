import React, { useMemo } from 'react';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

export function Terrain({ onGroundClick }) {
  // Generate a bumpy terrain geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 64, 64);
    const vertices = geo.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      // A simple formula to create waves and hills
      vertices[i + 2] = Math.sin(x / 4) * Math.cos(y / 4) * 2 + Math.random() * 0.2;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* The Clickable Invisible Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onClick={onGroundClick} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>

      {/* The Visible Mountain Terrain */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial
          color="#5c4a3d" // A desert/earthy color
          roughness={0.8}
          metalness={0.1}
          flatShading={true} // Gives it the "low-poly" look
        />
      </mesh>
      
      {/* A subtle grid overlay for the tactical feel */}
      <gridHelper args={[50, 50, '#ffffff', '#ffffff']} position={[0, 0.01, 0]} opacity={0.1} transparent/>
    </group>
  );
}
