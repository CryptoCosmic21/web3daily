// File: SolarSystem.jsx

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
import { FastAverageColor } from 'fast-average-color';

/**
 * Smoothly focuses camera on whichever planet was clicked.
 */
function FocusCamera({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    if (target && target.current) {
      const offsetPos = target.current.position.clone().add(new THREE.Vector3(0, 0, 8));
      camera.position.lerp(offsetPos, 0.05);
      camera.lookAt(target.current.position);
    }
  });
  return null;
}

/**
 * BodyWithLogo: Renders a planet or the Sun. Each planet has:
 *  - A unique orbit so it never crosses the center (Sun).
 *  - A custom radius, speed, and size.
 *  - A decal for the planet logo (optional bump map).
 */
const BodyWithLogo = forwardRef(function BodyWithLogo(
  {
    name = 'Planet',
    radius = 20,         // orbital radius from center
    speed = 0.3,         // how fast it orbits
    size = 2,            // actual sphere size
    decalUrl = '/textures/cosmos-atom-logo.png',
    bumpUrl = '/textures/generic-bump.png',
    isSun = false,       // if true, won't orbit
    isVisible = true,
    onClick
  },
  ref
) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [color, setColor] = useState('#ffffff');

  useImperativeHandle(ref, () => groupRef.current);

  const [decalMap, bumpMap] = useTexture([decalUrl, bumpUrl]);

  // Sample a color from the planet logo to tint the material
  useEffect(() => {
    if (!decalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = decalUrl;
    img.onload = async () => {
      const fac = new FastAverageColor();
      const result = await fac.getColorAsync(img);
      if (result?.rgb) {
        setColor(result.rgb);
      }
    };
  }, [decalUrl]);

  /**
   * Orbit math: We keep each planet’s orbit away from radius=0 so it never
   * passes through the Sun. For variety, each planet's orbit can have elliptical or wave-like paths.
   */
  useFrame(({ clock }) => {
    if (!groupRef.current || !isVisible || isSun) return;

    const t = clock.getElapsedTime();
    let x = 0;
    let y = 0;
    let z = 0;

    // Unique orbit pattern per planet name:
    switch (name) {
      case 'Osmosis':
        // Elliptical
        x = radius * Math.cos(speed * t);
        z = (radius * 0.8) * Math.sin(speed * t);
        break;

      case 'Celestia':
        x = (radius * 1.1) * Math.cos(speed * 0.9 * t);
        z = (radius * 0.7) * Math.sin(speed * 0.9 * t);
        break;

      case 'Mantra':
        x = radius * Math.cos(speed * 1.3 * t);
        z = (radius * 0.7) * Math.sin(speed * 1.3 * t);
        // Slight wave in Y
        y = 0.2 * radius * Math.sin(speed * 0.6 * t);
        break;

      case 'Sei':
        x = radius * Math.cos(speed * t);
        z = radius * Math.sin(speed * t);
        // Tilt a bit
        y = 0.2 * radius * Math.cos(speed * t);
        break;

      case 'Injective':
        // Another ellipse
        x = (radius * 0.8) * Math.cos(speed * 1.1 * t);
        z = (radius * 1.2) * Math.sin(speed * 1.1 * t);
        break;

      case 'THORChain':
        x = (radius * 1.2) * Math.cos(speed * 0.8 * t);
        z = (radius * 0.8) * Math.sin(speed * 0.8 * t);
        // Slight wave in Y
        y = 0.15 * radius * Math.sin(speed * 0.5 * t);
        break;

      case 'Secret':
        x = (radius * 1.1) * Math.cos(speed * 0.9 * t);
        z = (radius * 0.9) * Math.sin(speed * 0.9 * t);
        break;

      case 'Akash':
        x = radius * Math.cos(speed * 1.2 * t);
        z = (radius * 0.8) * Math.sin(speed * 1.2 * t);
        y = 0.15 * radius * Math.cos(speed * 0.6 * t);
        break;

      default:
        // If not matched above, do a simple circle
        x = radius * Math.cos(speed * t);
        z = radius * Math.sin(speed * t);
        break;
    }

    groupRef.current.position.set(x, y, z);
  });

  return (
    <group
      ref={groupRef}
      visible={isVisible}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(groupRef, name);
      }}
      scale={hovered ? 1.1 : 1}
    >
      <mesh castShadow receiveShadow>
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
          scale={size * 1.2}
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
    </group>
  );
});

export default function SolarSystem() {
  const [focusedRef, setFocusedRef] = useState(null);
  const [inspectedPlanet, setInspectedPlanet] = useState(null);

  // Refs for Sun + 8 planets
  const sunRef = useRef(null);
  const osmosisRef = useRef(null);
  const celestiaRef = useRef(null);
  const mantraRef = useRef(null);
  const seiRef = useRef(null);
  const injectiveRef = useRef(null);
  const thorchainRef = useRef(null);
  const secretRef = useRef(null);
  const akashRef = useRef(null);

  // On planet click => store ref + name so camera can focus
  const handlePlanetClick = (ref, name) => {
    setFocusedRef(ref);
    setInspectedPlanet(name);
  };

  // If no planet is inspected => show them all
  // If one is inspected => show only that planet (optional behavior)
  const isVisible = (planetName) => {
    if (!inspectedPlanet) return true;
    return inspectedPlanet === planetName;
  };

  return (
    <>
      {/* HUD text */}
      <div style={styles.hud}>
        {!inspectedPlanet ? (
          <p style={styles.info}>Click a planet to inspect</p>
        ) : (
          <div style={styles.inspectBox}>
            <p>{inspectedPlanet} inspection</p>
            <button
              style={styles.button}
              onClick={() => {
                setFocusedRef(null);
                setInspectedPlanet(null);
              }}
            >
              Close Inspection
            </button>
          </div>
        )}
      </div>

      <Canvas
        shadows
        style={{ width: '100%', height: '100vh' }}
        // Start camera far away so you see all planets (max zoom out)
        camera={{ position: [0, 0, 120], fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 30, 150]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />

          <Environment preset="dawn" />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade />

          {/* Sun (stationary, radius=0, no orbit) */}
          <BodyWithLogo
            name="Sun"
            ref={sunRef}
            radius={0}
            speed={0}
            size={5}
            decalUrl="/textures/cosmos-atom-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isSun
            isVisible={isVisible('Sun')}
            onClick={handlePlanetClick}
          />

          {/* Planets - carefully spaced so they never pass near the center */}
          <BodyWithLogo
            name="Osmosis"
            ref={osmosisRef}
            radius={15}
            speed={0.25}
            size={2}
            decalUrl="/textures/osmosis-osmo-logo.png"
            isVisible={isVisible('Osmosis')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Celestia"
            ref={celestiaRef}
            radius={25}
            speed={0.22}
            size={2.2}
            decalUrl="/textures/celestia-tia-logo.png"
            isVisible={isVisible('Celestia')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Mantra"
            ref={mantraRef}
            radius={35}
            speed={0.28}
            size={2}
            decalUrl="/textures/mantra-om-logo.png"
            isVisible={isVisible('Mantra')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Sei"
            ref={seiRef}
            radius={45}
            speed={0.3}
            size={2}
            decalUrl="/textures/sei-sei-logo.png"
            isVisible={isVisible('Sei')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Injective"
            ref={injectiveRef}
            radius={55}
            speed={0.24}
            size={2}
            decalUrl="/textures/injective-inj-logo.png"
            isVisible={isVisible('Injective')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="THORChain"
            ref={thorchainRef}
            radius={65}
            speed={0.26}
            size={2}
            decalUrl="/textures/thorchain-rune-logo.png"
            isVisible={isVisible('THORChain')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Secret"
            ref={secretRef}
            radius={75}
            speed={0.3}
            size={2}
            decalUrl="/textures/secret-scrt-logo.png"
            isVisible={isVisible('Secret')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogo
            name="Akash"
            ref={akashRef}
            radius={85}
            speed={0.25}
            size={2.4}
            decalUrl="/textures/akash-network-akt-logo.png"
            isVisible={isVisible('Akash')}
            onClick={handlePlanetClick}
          />

          {/* Smoothly move camera to clicked planet */}
          <FocusCamera target={focusedRef} />

          {/* Orbit Controls so user can rotate, zoom, pan */}
          <OrbitControls
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.3}
            // Let user zoom in but not out more than the starting vantage
            minDistance={10}
            maxDistance={120}
          />

          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
}

const styles = {
  hud: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: '#fff',
    zIndex: 999
  },
  info: {
    background: 'rgba(0,0,0,0.5)',
    padding: '8px 12px',
    borderRadius: 6
  },
  inspectBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'rgba(0,0,0,0.5)',
    padding: '8px 12px',
    borderRadius: 6
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid #666',
    background: '#444',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer'
  }
};
