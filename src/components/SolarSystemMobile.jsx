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
import { FastAverageColor } from 'fast-average-color';

/**
 * FocusCamera for smooth transitions when a planet is tapped/clicked.
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
 * BodyWithLogoMobile: same as desktop, but sized/tuned for smaller screens if desired.
 */
const BodyWithLogoMobile = forwardRef(function BodyWithLogoMobile(
  {
    name = 'Planet',
    radius = 20,
    speed = 0.3,
    size = 2,
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

  // Extract average color from the decal
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

  // Custom orbit, ensuring no planet passes near the center (Sun).
  useFrame(({ clock }) => {
    if (!meshRef.current || !isVisible || isSun) return;

    const t = clock.getElapsedTime();
    let x = 0;
    let y = 0;
    let z = 0;

    switch (name) {
      case 'Osmosis':
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
        y = 0.2 * radius * Math.sin(speed * 0.6 * t);
        break;

      case 'Sei':
        x = radius * Math.cos(speed * t);
        z = radius * Math.sin(speed * t);
        y = 0.2 * radius * Math.cos(speed * t);
        break;

      case 'Injective':
        x = (radius * 0.8) * Math.cos(speed * 1.1 * t);
        z = (radius * 1.2) * Math.sin(speed * 1.1 * t);
        break;

      case 'THORChain':
        x = (radius * 1.2) * Math.cos(speed * 0.8 * t);
        z = (radius * 0.8) * Math.sin(speed * 0.8 * t);
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
        // simple circle
        x = radius * Math.cos(speed * t);
        z = radius * Math.sin(speed * t);
        break;
    }

    meshRef.current.position.set(x, y, z);
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
      scale={hovered ? 1.1 : 1}
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
  );
});

export default function SolarSystemMobile() {
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

  // Planet click => focus
  const handlePlanetClick = (ref, name) => {
    setFocusedRef(ref);
    setInspectedPlanet(name);
  };

  const isVisible = (planetName) => {
    if (!inspectedPlanet) return true;
    return inspectedPlanet === planetName;
  };

  return (
    <>
      {inspectedPlanet && (
        <div style={styles.inspectBox}>
          <p>{inspectedPlanet} Inspection</p>
          <button
            style={styles.button}
            onClick={() => {
              setFocusedRef(null);
              setInspectedPlanet(null);
            }}
          >
            Close
          </button>
        </div>
      )}

      <Canvas
        style={{ width: '100vw', height: '100vh', touchAction: 'manipulation' }}
        // Start fully zoomed out to see all planets
        camera={{ position: [0, 0, 120], fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 30, 150]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />

          <Environment preset="dawn" />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade />

          {/* Sun at center */}
          <BodyWithLogoMobile
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

          {/* 8 Planets, spaced out so they don't collide or pass center */}
          <BodyWithLogoMobile
            name="Osmosis"
            ref={osmosisRef}
            radius={15}
            speed={0.25}
            size={2}
            decalUrl="/textures/osmosis-osmo-logo.png"
            isVisible={isVisible('Osmosis')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Celestia"
            ref={celestiaRef}
            radius={25}
            speed={0.22}
            size={2.2}
            decalUrl="/textures/celestia-tia-logo.png"
            isVisible={isVisible('Celestia')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Mantra"
            ref={mantraRef}
            radius={35}
            speed={0.28}
            size={2}
            decalUrl="/textures/mantra-om-logo.png"
            isVisible={isVisible('Mantra')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Sei"
            ref={seiRef}
            radius={45}
            speed={0.3}
            size={2}
            decalUrl="/textures/sei-sei-logo.png"
            isVisible={isVisible('Sei')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Injective"
            ref={injectiveRef}
            radius={55}
            speed={0.24}
            size={2}
            decalUrl="/textures/injective-inj-logo.png"
            isVisible={isVisible('Injective')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="THORChain"
            ref={thorchainRef}
            radius={65}
            speed={0.26}
            size={2}
            decalUrl="/textures/thorchain-rune-logo.png"
            isVisible={isVisible('THORChain')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Secret"
            ref={secretRef}
            radius={75}
            speed={0.3}
            size={2}
            decalUrl="/textures/secret-scrt-logo.png"
            isVisible={isVisible('Secret')}
            onClick={handlePlanetClick}
          />

          <BodyWithLogoMobile
            name="Akash"
            ref={akashRef}
            radius={85}
            speed={0.25}
            size={2.4}
            decalUrl="/textures/akash-network-akt-logo.png"
            isVisible={isVisible('Akash')}
            onClick={handlePlanetClick}
          />

          {/* Smooth focus transition */}
          <FocusCamera target={focusedRef} />

          <OrbitControls
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.3}
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
  inspectBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '0.8rem 1rem',
    borderRadius: 6
  },
  button: {
    padding: '0.5rem',
    fontWeight: 'bold',
    borderRadius: 6,
    background: '#444',
    color: '#fff',
    border: '1px solid #666',
    cursor: 'pointer'
  }
};
