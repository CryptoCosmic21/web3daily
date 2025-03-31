import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  Suspense
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

function FocusCamera({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    if (target && target.current) {
      camera.position.lerp(
        new THREE.Vector3(
          target.current.position.x,
          target.current.position.y,
          target.current.position.z + 5
        ),
        0.05
      );
      camera.lookAt(target.current.position);
    }
  });
  return null;
}

const BodyWithLogo = forwardRef(function BodyWithLogo(
  {
    radius = 5,
    speed = 0.3,
    size = 1.5,
    color = '#ffcc33',
    decalUrl = '/textures/cosmos-atom-logo.png',
    bumpUrl = '/textures/generic-bump.png',
    isSun = false,
    name = 'Planet',
    onClick
  },
  ref
) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useImperativeHandle(ref, () => groupRef.current);

  const [decalMap, bumpMap] = useTexture([decalUrl, bumpUrl]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (!isSun) {
        const t = clock.getElapsedTime() * speed;
        groupRef.current.position.x = radius * Math.cos(t);
        groupRef.current.position.z = radius * Math.sin(t);
      }
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group
      ref={groupRef}
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
        onClick?.(groupRef);
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
          position={[0, 0, size * 0.98]}
          scale={size * 0.8}
          map={decalMap}
          rotation={[0, 0, 0]}
          depthTest
          depthWrite
        />
      </mesh>
    </group>
  );
});

export default function SolarSystem() {
  const [focusedRef, setFocusedRef] = useState(null);
  const sunRef = useRef(null);
  const planetRef = useRef(null);
  const celestiaRef = useRef(null);

  return (
    <>
      <div style={styles.hud}>
        <button style={styles.button} onClick={() => setFocusedRef(sunRef)}>
          Focus Sun
        </button>
        <button style={styles.button} onClick={() => setFocusedRef(planetRef)}>
          Focus Planet
        </button>
        <button style={styles.button} onClick={() => setFocusedRef(celestiaRef)}>
          Focus Celestia
        </button>
        <button style={styles.button} onClick={() => setFocusedRef(null)}>
          Reset
        </button>
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

          <BodyWithLogo
            ref={sunRef}
            radius={0}
            speed={0}
            size={3}
            color="#ffcc33"
            decalUrl="/textures/cosmos-atom-logo.png"
            bumpUrl="/textures/generic-bump.png"
            isSun
            name="Sun"
            onClick={() => setFocusedRef(sunRef)}
          />

          <BodyWithLogo
            ref={planetRef}
            radius={10}
            speed={0.3}
            size={1.5}
            color="#6f4ad0"
            decalUrl="/textures/osmosis-osmo-logo.png"
            bumpUrl="/textures/generic-bump.png"
            name="Planet"
            onClick={() => setFocusedRef(planetRef)}
          />

          <BodyWithLogo
            ref={celestiaRef}
            radius={15}
            speed={0.25}
            size={1.8}
            color="#FFD1DC"
            decalUrl="/textures/celestia-tia-logo.png"
            bumpUrl="/textures/generic-bump.png"
            name="Celestia"
            onClick={() => setFocusedRef(celestiaRef)}
          />

          <FocusCamera target={focusedRef} />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            autoRotate
            autoRotateSpeed={0.4}
            minDistance={3}
            maxDistance={60}
          />

          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.8}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
}

const styles = {
  hud: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 999,
    display: 'flex',
    gap: '0.5rem'
  },
  button: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    background: '#444',
    color: '#fff',
    border: '1px solid #666',
    borderRadius: '4px'
  }
};
