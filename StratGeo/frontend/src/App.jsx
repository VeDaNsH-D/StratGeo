import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import io from 'socket.io-client';

import { Tank } from './components/Tank';
import { Terrain } from './components/Terrain';

// Connect to Backend (Ensure port matches backend)
const socket = io('http://localhost:3001');

export default function App() {
  const [units, setUnits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Listen for initial data
    socket.on('init', (serverUnits) => {
      setUnits(serverUnits);
    });

    // Listen for updates from other users
    socket.on('updateUnits', (serverUnits) => {
      setUnits(serverUnits);
    });

    return () => socket.off();
  }, []);

  const handleUnitClick = (e, id) => {
    e.stopPropagation(); // Don't click the ground
    setSelectedId(id);
  };

  const handleGroundClick = (e) => {
    if (selectedId) {
      // Get click coordinates
      const point = e.point;
      const newPos = [point.x, 0, point.z];

      // Optimistic UI update (update locally instantly)
      setUnits(prev => prev.map(u => u.id === selectedId ? { ...u, position: newPos } : u));

      // Send move to server
      socket.emit('moveUnit', { id: selectedId, position: newPos });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
        {/* Atmosphere */}
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff00" />
        
        <OrbitControls makeDefault />

        {/* Game World */}
        <Terrain onGroundClick={handleGroundClick} />

        {/* Render Units */}
        {units.map((unit) => (
          <Tank 
            key={unit.id}
            position={unit.position}
            color={unit.color}
            isSelected={selectedId === unit.id}
            onClick={(e) => handleUnitClick(e, unit.id)}
          />
        ))}
      </Canvas>
    </div>
  );
}
