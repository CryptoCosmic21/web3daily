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
import { FastAverageColor } from 'fast-average-color'; // <--- Named import

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

const BodyWithLogo = forwardRef(function BodyWithLogo(
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
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [color, setColor] = useState('#ffffff');

  useImperativeHandle(ref, () => groupRef.current);

  const [decalMap, bumpMap] = useTexture([decalUrl, bumpUrl]);

  useEffect(() => {
    if (!decalUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = decalUrl;

    img.onload = async () => {
      const fac = new FastAverageColor(); // <-- Named constructor
      const result = await fac.getColorAsync(img);
      if (result && result.rgb) {
        setColor(result.rgb);
      }
    };
  }, [decalUrl]);

  useFrame(({ clock }) => {
    if (groupRef.current && isVisible) {
      if (!isSun) {
        const t = clock.getElapsedTime() * speed;
        groupRef.current.position.x = radius * Math.cos(t);
        groupRef.current.position.z = radius * Math.sin(t);
      }
    }
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
      scale={hovered ? 1.05 : 1}
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

  const sunRef = useRef(null);
  const osmosisRef = useRef(null);
  const celestiaRef = useRef(null);

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
        camera={{ position: [0, 0, 20], fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 10, 40]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="white" />

          <Environment preset="dawn" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

          {/* Sun */}
          <BodyWithLogo
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
          <BodyWithLogo
            name="Osmosis"
            ref={osmosisRef}
            radius={10}
            speed={0.3}
            size={1.5}
            decalUrl="/textures/osmosis-osmo-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isVisible={isVisible('Osmosis')}
            onClick={handlePlanetClick}
          />

          {/* Celestia */}
          <BodyWithLogo
            name="Celestia"
            ref={celestiaRef}
            radius={14}
            speed={0.2}
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
            autoRotateSpeed={0.4}
            minDistance={6}
            maxDistance={35}
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
