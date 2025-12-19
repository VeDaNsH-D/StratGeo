import React, { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, SoftShadows, useTexture } from '@react-three/drei';
import io from 'socket.io-client';
import * as THREE from 'three';

import { Tank } from './components/Tank';
import { Soldier } from './components/Soldier';

const socket = io('http://localhost:3001');

// --- CAMERA CONTROLLER ---
function CameraController({ targetPosition, isFollowing }) {
  const { camera, controls } = useThree();
  useFrame(() => {
    if (isFollowing && targetPosition) {
      const targetCamPos = new THREE.Vector3(targetPosition[0], targetPosition[1] + 20, targetPosition[2] + 25);
      camera.position.lerp(targetCamPos, 0.05);
      controls?.target.lerp(new THREE.Vector3(...targetPosition), 0.1);
      controls?.update();
    }
  });
  return null;
}

// --- REAL TERRAIN COMPONENT ---
function RealTerrain({ onGroundClick }) {
  const props = useTexture({
    map: '/terrain.png',
    displacementMap: '/terrain.png',
  });

  props.map.wrapS = props.map.wrapT = THREE.RepeatWrapping;
  props.displacementMap.wrapS = props.displacementMap.wrapT = THREE.RepeatWrapping;
  props.map.repeat.set(4, 4);

  return (
    <group>
      {/* 1. The Solid Ground */}
      <mesh 
        name="ground" 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]} 
        onClick={onGroundClick} 
        receiveShadow
      >
        <planeGeometry args={[100, 100, 128, 128]} />
        <meshStandardMaterial 
          color="#8B5A2B" // Darker Earth Tone
          displacementScale={6} // Slightly lower spikes
          displacementBias={-1} 
          {...props} 
        />
      </mesh>

      {/* 2. The Tactical Wireframe Overlay (The "Tron" Look) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
         <planeGeometry args={[100, 100, 128, 128]} />
         <meshBasicMaterial 
            color="#00ff00" 
            wireframe 
            transparent 
            opacity={0.15} 
            displacementScale={6} // Must match the ground!
            displacementBias={-1}
            displacementMap={props.displacementMap}
         />
      </mesh>
    </group>
  );
}

export default function App() {
  const [units, setUnits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    socket.on('init', setUnits);
    socket.on('updateUnits', setUnits);
    return () => socket.off();
  }, []);

  const handleUnitClick = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsFollowing(false);
  };

  const handleGroundClick = (e) => {
    if (selectedId) {
      const newPos = [e.point.x, 0, e.point.z];
      setUnits(prev => prev.map(u => u.id === selectedId ? { ...u, position: newPos } : u));
      socket.emit('moveUnit', { id: selectedId, position: newPos });
    }
  };

  const selectedUnit = units.find(u => u.id === selectedId);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden' }}>
      
      {/* --- NEW HUD UI (CLEAN & ORGANIZED) --- */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 10,
        fontFamily: "'Courier New', Courier, monospace", // Monospace is key for tactical look
        pointerEvents: 'none', // Allows clicks to pass through to the map
        userSelect: 'none'
      }}>
        {/* The Glass Panel */}
        <div style={{
          background: 'rgba(0, 15, 0, 0.85)', // Dark Green/Black Tint
          border: '1px solid #33ff33',
          borderLeft: '4px solid #33ff33', // Thick accent line
          padding: '20px',
          width: '280px',
          boxShadow: '0 0 15px rgba(0, 255, 0, 0.2)',
          backdropFilter: 'blur(4px)', // Blurs the 3D map behind it
          pointerEvents: 'auto' // Re-enable clicks for the buttons inside
        }}>
          {/* Header */}
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            color: '#fff',
            letterSpacing: '2px',
            borderBottom: '1px solid #333',
            paddingBottom: '8px'
          }}>
            STRATGEO <span style={{ color: '#33ff33' }}>//</span> CMD
          </h2>

          {/* Status Lines */}
          <div style={{ fontSize: '11px', color: '#88ff88', marginBottom: '16px', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>STATUS:</span> 
              <span style={{ color: '#fff' }}>ONLINE ●</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>LATENCY:</span> 
              <span>24ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>UNITS DETECTED:</span> 
              <span>{units.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SECTOR:</span> 
              <span>GRID-7</span>
            </div>
          </div>

          {/* Camera Toggle Button */}
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            style={{
              width: '100%',
              background: isFollowing ? '#33ff33' : 'transparent',
              color: isFollowing ? '#000' : '#33ff33',
              border: '1px solid #33ff33',
              padding: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              marginBottom: '10px'
            }}
            onMouseOver={(e) => !isFollowing && (e.target.style.background = 'rgba(51, 255, 51, 0.1)')}
            onMouseOut={(e) => !isFollowing && (e.target.style.background = 'transparent')}
          >
            {isFollowing ? "◉ TARGET LOCKED" : "◎ FREE ROAM"}
          </button>

          {/* Selected Unit Info */}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '10px', 
            color: '#666', 
            borderTop: '1px solid #333', 
            paddingTop: '8px' 
          }}>
            {selectedUnit 
              ? <span style={{ color: '#33ff33' }}>&gt; ORDERS: UNIT {selectedUnit.id.toUpperCase()} READY</span> 
              : <span>&gt; SYSTEM IDLE. AWAITING INPUT...</span>}
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 30, 30], fov: 45 }} shadows>
        {/* ... Keep your existing Canvas content (Sky, Lights, Terrain, Units) unchanged ... */}
        <Sky sunPosition={[7, 5, 1]} />
        <ambientLight intensity={1.5} /> 
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
        <OrbitControls makeDefault />
        <CameraController targetPosition={selectedUnit ? selectedUnit.position : null} isFollowing={isFollowing} />

        <React.Suspense fallback={null}>
            <RealTerrain onGroundClick={handleGroundClick} />
        </React.Suspense>

        {units.map((unit) => (
          unit.type === 'tank' 
            ? <Tank key={unit.id} {...unit} isSelected={selectedId === unit.id} onClick={(e) => handleUnitClick(e, unit.id)} />
            : <Soldier key={unit.id} {...unit} isSelected={selectedId === unit.id} onClick={(e) => handleUnitClick(e, unit.id)} />
        ))}
      </Canvas>
    </div>
  );
}
