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
  useTexture,
  Line
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FastAverageColor } from 'fast-average-color';

// ---------------------------------------------------------------------
// Texture mapping for mobile – "Atom" is the central node.
const planetTextureMapMobile = {
  Atom: "cosmos-atom-logo.png",
  Osmosis: "osmosis-osmo-logo.png",
  Sei: "sei-sei-logo.png",
  Celestia: "celestia-tia-logo.png",
  Mantra: "mantra-om-logo.png",
  Injective: "injective-inj-logo.png",
  THORChain: "thorchain-rune-logo.png",
  Secret: "secret-scrt-logo.png",
  Akash: "akash-network-akt-logo.png"
};

// Geometric positions for mobile – central "Atom" at (0,0,0) and outer planets arranged on a circle (radius 40).
const radiusMobile = 40;
const fixedPlanetPositionsMobile = {
  Atom: new THREE.Vector3(0, 0, 0),
  Osmosis: new THREE.Vector3(radiusMobile * Math.cos(0), radiusMobile * Math.sin(0), 0),
  Sei: new THREE.Vector3(radiusMobile * Math.cos(Math.PI / 4), radiusMobile * Math.sin(Math.PI / 4), 0),
  Celestia: new THREE.Vector3(radiusMobile * Math.cos(Math.PI / 2), radiusMobile * Math.sin(Math.PI / 2), 0),
  Mantra: new THREE.Vector3(radiusMobile * Math.cos((3 * Math.PI) / 4), radiusMobile * Math.sin((3 * Math.PI) / 4), 0),
  Injective: new THREE.Vector3(radiusMobile * Math.cos(Math.PI), radiusMobile * Math.sin(Math.PI), 0),
  THORChain: new THREE.Vector3(radiusMobile * Math.cos((5 * Math.PI) / 4), radiusMobile * Math.sin((5 * Math.PI) / 4), 0),
  Secret: new THREE.Vector3(radiusMobile * Math.cos((3 * Math.PI) / 2), radiusMobile * Math.sin((3 * Math.PI) / 2), 0),
  Akash: new THREE.Vector3(radiusMobile * Math.cos((7 * Math.PI) / 4), radiusMobile * Math.sin((7 * Math.PI) / 4), 0)
};
// ---------------------------------------------------------------------

/**
 * FlowLineMobile
 *
 * Draws a straight dashed line between two fixed points.
 * The dashOffset is animated to simulate a moving light pulse.
 */
function FlowLineMobile({ start, end, color = "#ffffff" }) {
  const [dashOffset, setDashOffset] = useState(0);
  const points = [start, end];
  useFrame((_, delta) => {
    setDashOffset(prev => prev - delta * 3);
  });
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      dashed
      dashSize={0.5}
      gapSize={0.3}
      dashOffset={dashOffset}
      opacity={1}
      transparent
    />
  );
}

/**
 * FixedPlanetMobile
 *
 * Renders a planet at a fixed position with subtle pulsation.
 * Tapping a planet triggers inspection mode.
 */
const FixedPlanetMobile = forwardRef(function FixedPlanetMobile(
  { name, decalFile, bumpFile = "generic-bump.png", hasRing = false, onClick },
  ref
) {
  const groupRef = useRef(null);
  useImperativeHandle(ref, () => groupRef.current);
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [decalMap, bumpMap] = useTexture([`/textures/${decalFile}`, `/textures/${bumpFile}`]);

  useEffect(() => {
    if (!decalFile) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `/textures/${decalFile}`;
    img.onload = async () => {
      const fac = new FastAverageColor();
      const result = await fac.getColorAsync(img);
      if (result?.rgb) setBaseColor(result.rgb);
    };
  }, [decalFile]);

  useEffect(() => {
    if (groupRef.current && fixedPlanetPositionsMobile[name]) {
      groupRef.current.position.copy(fixedPlanetPositionsMobile[name]);
    }
  }, [name]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const pulsate = 1 + 0.05 * Math.sin(t * 3);
    groupRef.current.scale.set(pulsate, pulsate, pulsate);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(groupRef, name);
      }}
    >
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.4}
          bumpMap={bumpMap}
          bumpScale={0.15}
        />
        <Decal
          position={[0, 0, 5 * 1.02]}
          scale={5 * 1.2}
          map={decalMap}
          rotation={[0, 0, 0]}
          transparent
          opacity={0.7}
          polygonOffset
          polygonOffsetFactor={-10}
          depthTest
          depthWrite
        />
      </mesh>
      {hasRing && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5 * 1.5, 5 * 2.2, 64]} />
          <meshStandardMaterial
            color="#ccc"
            side={THREE.DoubleSide}
            emissive="#555"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
});

/**
 * SolarSystemMobileScene
 *
 * Renders all planets for mobile with fixed positions.
 * Draws animated beams connecting the central "Atom" to each outer planet
 * and connecting every pair of outer planets.
 */
function SolarSystemMobileScene({ onInspect }) {
  const planetOrder = [
    "Atom",
    "Osmosis",
    "Sei",
    "Celestia",
    "Mantra",
    "Injective",
    "THORChain",
    "Secret",
    "Akash"
  ];

  return (
    <>
      {planetOrder.map((name) => (
        <FixedPlanetMobile
          key={name}
          name={name}
          decalFile={planetTextureMapMobile[name]}
          bumpFile="generic-bump.png"
          hasRing={name === "THORChain"}
          onClick={(ref, name) => onInspect(ref, name)}
        />
      ))}
      {/* Connect Atom to each outer planet */}
      {planetOrder
        .filter((n) => n !== "Atom")
        .map((n) => (
          <FlowLineMobile
            key={`atom-${n}`}
            start={fixedPlanetPositionsMobile["Atom"]}
            end={fixedPlanetPositionsMobile[n]}
            color="#ffffff"
          />
        ))}
      {/* Connect every pair of outer planets */}
      {planetOrder
        .filter((n) => n !== "Atom")
        .map((n, i, arr) =>
          arr.slice(i + 1).map((m) => (
            <FlowLineMobile
              key={`${n}-${m}`}
              start={fixedPlanetPositionsMobile[n]}
              end={fixedPlanetPositionsMobile[m]}
              color="#ffffff"
            />
          ))
        )}
    </>
  );
}

/**
 * FocusCamera
 *
 * If no planet is inspected, resets the camera to the default overview.
 */
function FocusCamera({ inspected }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!inspected) {
      camera.position.set(0, 0, 120);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }, [inspected, camera]);
  return null;
}

/**
 * Main Mobile SolarSystem component.
 * - Tapping a planet triggers inspection mode.
 * - In inspection mode OrbitControls allow free zoom/pan.
 * - Closing inspection resets the view to the default overview.
 */
export function SolarSystemMobile() {
  const [focusedRef, setFocusedRef] = useState(null);
  const [inspectedPlanet, setInspectedPlanet] = useState(null);
  const controlsRef = useRef();
  const defaultCameraPos = new THREE.Vector3(0, 0, 120);

  const handleInspect = (ref, name) => {
    setFocusedRef(ref);
    setInspectedPlanet(name);
  };

  useEffect(() => {
    if (!inspectedPlanet && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [inspectedPlanet]);

  return (
    <>
      <div style={styles.hud}>
        {!inspectedPlanet ? (
          <p style={styles.info}>Tap a planet to inspect</p>
        ) : (
          <div style={styles.inspectBox}>
            <p>{inspectedPlanet} inspection</p>
            <button style={styles.button} onClick={() => {
              setFocusedRef(null);
              setInspectedPlanet(null);
            }}>
              Close
            </button>
          </div>
        )}
      </div>
      <Canvas
        style={{ width: '100vw', height: '100vh', touchAction: 'manipulation' }}
        camera={{ position: defaultCameraPos.toArray(), fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 100, 600]} />
          <ambientLight intensity={0.8} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#fff" />
          <Environment preset="dawn" />
          <Stars radius={200} depth={60} count={6000} factor={6} fade />
          
          <SolarSystemMobileScene onInspect={handleInspect} />
          
          <FocusCamera inspected={inspectedPlanet} />
          
          <OrbitControls
            ref={controlsRef}
            enableZoom
            enablePan
            autoRotate={!inspectedPlanet}
            autoRotateSpeed={!inspectedPlanet ? 0.1 : 0}
            minDistance={inspectedPlanet ? 10 : 20}
            maxDistance={inspectedPlanet ? 100 : 80}
          />
          
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.35} luminanceSmoothing={0.7} />
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
    padding: '0.4rem 1rem',
    border: '1px solid #666',
    background: '#333',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer'
  }
};
