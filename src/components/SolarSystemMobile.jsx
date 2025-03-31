// File: SolarSystemMobile.jsx

import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  Suspense,
  useEffect
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Decal,
  Environment,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FastAverageColor } from 'fast-average-color'; // <--- Named

function FocusCamera({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    if (target && target.current) {
      const pos = target.current.position.clone().add(new THREE.Vector3(0, 0, 8));
      camera.position.lerp(pos, 0.05);
      camera.lookAt(target.current.position);
    }
  });
  return null;
}

const BodyWithLogoMobile = forwardRef(function BodyWithLogoMobile(
  {
    name = 'Planet',
    radius = 5,
    speed = 0.3,
    size = 1.5,
    decalUrl = '/textures/cosmos-atom-logo.png',
    bumpUrl = '/textures/generic-bump.png',
    isSun = false,
    isVisible = true,
    onClick
  },
  ref
) {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [color, setColor] = useState('#ffffff');

  useImperativeHandle(ref, () => meshRef.current);

  const [decalMap, bumpMap] = useTexture([decalUrl, bumpUrl]);

  // use fast-average-color
  useEffect(() => {
    if (!decalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = decalUrl;

    img.onload = async () => {
      const fac = new FastAverageColor();
      const result = await fac.getColorAsync(img);
      if (result && result.rgb) {
        setColor(result.rgb);
      }
    };
  }, [decalUrl]);

  useFrame(({ clock }) => {
    if (meshRef.current && isVisible && !isSun) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.position.x = radius * Math.cos(t);
      meshRef.current.position.z = radius * Math.sin(t);
    }
  });

  return (
    <mesh
      ref={meshRef}
      visible={isVisible}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(meshRef, name);
      }}
      scale={hovered ? 1.05 : 1}
    >
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        color={color}
        bumpMap={bumpMap}
        bumpScale={0.15}
        roughness={0.4}
        metalness={0.3}
      />
      <Decal
        position={[0, 0, size * 1.02]}
        scale={size * 1.3}
        map={decalMap}
        rotation={[0, 0, 0]}
        depthTest
        depthWrite
        polygonOffset
        polygonOffsetFactor={-10}
        opacity={0.7}
        transparent
      />
    </mesh>
  );
});

export default function SolarSystemMobile() {
  const [focusedRef, setFocusedRef] = useState(null);
  const [inspectedPlanet, setInspectedPlanet] = useState(null);

  const sunRef = useRef(null);
  const planetOneRef = useRef(null);
  const planetTwoRef = useRef(null);

  const handlePlanetClick = (ref, name) => {
    setFocusedRef(ref);
    setInspectedPlanet(name);
  };

  const isVisible = (pName) => {
    if (!inspectedPlanet) return true;
    return inspectedPlanet === pName;
  };

  return (
    <>
      <div style={styles.sidebar}>
        <h3 style={styles.title}>Planets</h3>
        {!inspectedPlanet ? (
          <p style={styles.hint}>Tap a planet or pick from below:</p>
        ) : (
          <div style={styles.inspectBox}>
            <p>{inspectedPlanet} Inspection</p>
            <button
              style={styles.btn}
              onClick={() => {
                setFocusedRef(null);
                setInspectedPlanet(null);
              }}
            >
              Close
            </button>
          </div>
        )}

        {!inspectedPlanet && (
          <>
            <button style={styles.btn} onClick={() => handlePlanetClick(sunRef, 'Sun')}>
              Sun
            </button>
            <button
              style={styles.btn}
              onClick={() => handlePlanetClick(planetOneRef, 'Osmosis')}
            >
              Osmosis
            </button>
            <button
              style={styles.btn}
              onClick={() => handlePlanetClick(planetTwoRef, 'Celestia')}
            >
              Celestia
            </button>
          </>
        )}
      </div>

      <Canvas
        style={{ width: '100vw', height: '100vh', touchAction: 'manipulation' }}
        camera={{ position: [0, 0, 22], fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 10, 40]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />

          <Environment preset="dawn" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

          {/* Sun */}
          <BodyWithLogoMobile
            name="Sun"
            ref={sunRef}
            radius={0}
            speed={0}
            size={3}
            decalUrl="/textures/cosmos-atom-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isSun
            isVisible={isVisible('Sun')}
            onClick={handlePlanetClick}
          />

          {/* Osmosis */}
          <BodyWithLogoMobile
            name="Osmosis"
            ref={planetOneRef}
            radius={10}
            speed={0.3}
            size={1.5}
            decalUrl="/textures/osmosis-osmo-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isVisible={isVisible('Osmosis')}
            onClick={handlePlanetClick}
          />

          {/* Celestia */}
          <BodyWithLogoMobile
            name="Celestia"
            ref={planetTwoRef}
            radius={13}
            speed={0.25}
            size={1.8}
            decalUrl="/textures/celestia-tia-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isVisible={isVisible('Celestia')}
            onClick={handlePlanetClick}
          />

          <FocusCamera target={focusedRef} />

          <OrbitControls
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={6}
            maxDistance={30}
          />

          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '180px',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.8rem',
    boxSizing: 'border-box'
  },
  title: {
    margin: 0,
    marginBottom: '0.5rem',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  hint: {
    fontSize: '0.9rem',
    margin: 0,
    marginBottom: '0.5rem'
  },
  inspectBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 12px',
    borderRadius: 6
  },
  btn: {
    padding: '0.5rem',
    fontWeight: 'bold',
    borderRadius: 6,
    background: '#444',
    color: '#fff',
    border: '1px solid #666',
    cursor: 'pointer'
  }
};
