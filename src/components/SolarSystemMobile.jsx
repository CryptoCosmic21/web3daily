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

/** Smooth camera movement to clicked planet */
function FocusCamera({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    if (target && target.current) {
      const offset = target.current.position.clone().add(new THREE.Vector3(0, 0, 8));
      camera.position.lerp(offset, 0.05);
      camera.lookAt(target.current.position);
    }
  });
  return null;
}

/** 
 * BodyWithLogoMobile 
 * - No local spin => always see decal 
 * - Use fast-average-color to set planet color from logo 
 */
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

  // Load decal + bump
  const [decalMap, bumpMap] = useTexture([decalUrl, bumpUrl]);

  // Extract planet color from decal
  useEffect(() => {
    if (!decalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = decalUrl;
    img.onload = async () => {
      const fac = new FastAverageColor();
      const result = await fac.getColorAsync(img);
      if (result?.rgb) setColor(result.rgb);
    };
  }, [decalUrl]);

  // Only revolve around center
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

  // Refs to each planet
  const sunRef = useRef(null);
  const planetOneRef = useRef(null);
  const planetTwoRef = useRef(null);

  /** On planet click => set camera focus + mark that planet as inspected. */
  const handlePlanetClick = (ref, name) => {
    setFocusedRef(ref);
    setInspectedPlanet(name);
  };

  /** Visible if no planet is inspected or if it matches the planet name. */
  const isVisible = (pName) => {
    if (!inspectedPlanet) return true;
    return inspectedPlanet === pName;
  };

  return (
    <>
      {/* If a planet is inspected, show a small floating box to close */}
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
        camera={{ position: [0, 0, 22], fov: 50 }}
      >
        <Suspense fallback={null}>
          {/* Basic Lights + Environment */}
          <fog attach="fog" args={['#000000', 10, 40]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />

          <Environment preset="dawn" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

          {/* Bodies */}
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

          {/* Smooth camera transitions */}
          <FocusCamera target={focusedRef} />

          {/* User can still pinch or two-finger drag */}
          <OrbitControls
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={6}
            maxDistance={30}
          />

          {/* Bloom effect */}
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.8} />
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
    gap: '0.3rem',
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
