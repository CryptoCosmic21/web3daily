import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Effects } from '@react-three/drei';
import { Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function Sun({ size = 2, color = 'yellow' }) {
  return (
    <mesh>
      <sphereGeometry args={[size, 96, 96]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

function PlanetOrbit({ radius = 5, speed = 0.5, size = 0.5, color = 'deepskyblue' }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    meshRef.current.position.x = radius * Math.cos(t);
    meshRef.current.position.z = radius * Math.sin(t);
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
    </mesh>
  );
}

function RingedPlanet({ radius = 9, speed = 0.4, size = 1, color = 'lightcoral' }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    groupRef.current.position.x = radius * Math.cos(t);
    groupRef.current.position.z = radius * Math.sin(t);
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.5, 64]} />
        <meshBasicMaterial
          color="grey"
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

export default function SolarSystem() {
  return (
    <Canvas
      style={{ width: '100%', height: '100vh' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 15], fov: 50 }}
    >
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 10, 25]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <Sun />
      <PlanetOrbit radius={5} speed={0.5} size={0.5} color="deepskyblue" />
      <PlanetOrbit radius={7} speed={0.3} size={0.7} color="lightgreen" />
      <RingedPlanet radius={9} speed={0.4} size={1} color="lightcoral" />
      
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      
      {/* Use only Bloom for now */}
     
    </Canvas>
  );
}
