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
  Trail,
  Points,
  PointMaterial
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  ChromaticAberration
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import * as THREE from 'three';
import { FastAverageColor } from 'fast-average-color';

/**
 * Map planet names to texture filenames.
 */
const planetTextureMapMobile = {
  Sun: "cosmos-atom-logo.png",
  Osmosis: "osmosis-osmo-logo.png",
  Sei: "sei-sei-logo.png",
  Celestia: "celestia-tia-logo.png",
  Mantra: "mantra-om-logo.png",
  Injective: "injective-inj-logo.png",
  THORChain: "thorchain-rune-logo.png",
  Secret: "secret-scrt-logo.png",
  Akash: "akash-network-akt-logo.png"
};

const initialPlanetDataMobile = {
  Osmosis: { radius: 25, speed: 0.25, size: 1.6, directionFactor: 1 },
  Sei: { radius: 35, speed: 0.3, size: 1.3, directionFactor: 1 },
  Celestia: { radius: 45, speed: 0.23, size: 2.4, directionFactor: 1 },
  Mantra: { radius: 55, speed: 0.32, size: 2, directionFactor: 1 },
  Injective: { radius: 65, speed: 0.21, size: 2, directionFactor: 1 },
  THORChain: { radius: 75, speed: 0.28, size: 2.2, directionFactor: 1, hasRing: true },
  Secret: { radius: 85, speed: 0.26, size: 1.8, directionFactor: 1 },
  Akash: { radius: 95, speed: 0.24, size: 2.4, directionFactor: 1 }
};

function PlanetRing({ inner = 2.5, outer = 3.5 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 64]} />
      <meshStandardMaterial
        color="#ccc"
        side={THREE.DoubleSide}
        emissive="#555"
        emissiveIntensity={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/** Mobile orbiting planet component */
const OrbitingPlanetMobile = forwardRef(function OrbitingPlanetMobile(
  { name, data, decalFile, bumpFile = "generic-bump.png", isSun = false },
  ref
) {
  const groupRef = useRef(null);
  useImperativeHandle(ref, () => groupRef.current);

  const [baseColor, setBaseColor] = useState('#ffffff');
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimeout = useRef(null);

  const [decalMap, bumpMap] = useTexture([
    `/textures/${decalFile}`,
    `/textures/${bumpFile}`
  ]);

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

  useFrame(({ clock }) => {
    if (!groupRef.current || isSun) return;
    const t = clock.getElapsedTime();
    const dir = data.directionFactor;
    const r = data.radius;
    const s = data.speed;
    const x = r * Math.cos(s * dir * t);
    const z = r * Math.sin(s * dir * t);
    groupRef.current.position.set(x, 0, z);
  });

  useEffect(() => {
    if (flash) {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
      flashTimeout.current = setTimeout(() => setFlash(false), 300);
    }
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, [flash]);

  useEffect(() => {
    groupRef.current.userData.handleCollision = () => setFlash(true);
  }, []);

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
    >
      <mesh>
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial
          color={flash ? '#ff4444' : baseColor}
          emissive={hovered ? baseColor : '#000'}
          emissiveIntensity={hovered ? 0.3 : 0.05}
          roughness={0.3}
          metalness={0.4}
          bumpMap={bumpMap}
          bumpScale={0.15}
        />
        <Decal
          position={[0, 0, data.size * 1.02]}
          scale={data.size * 1.2}
          map={decalMap}
          rotation={[0, 0, 0]}
          transparent
          opacity={flash ? 0.4 : 0.7}
          polygonOffset
          polygonOffsetFactor={-10}
          depthTest
          depthWrite
        />
      </mesh>
      {data.hasRing && <PlanetRing inner={data.size * 1.5} outer={data.size * 2.2} />}
    </group>
  );
});

/** Mobile comet component with smoother motion */
function CometMobile({ comet, onHit }) {
  const cometRef = useRef(null);
  useFrame((state, delta) => {
    if (!cometRef.current) return;
    comet.progress = THREE.MathUtils.clamp(comet.progress + comet.speed * delta * 60, 0, 1);
    if (comet.progress >= 1) {
      comet.isDead = true;
    } else {
      const targetPos = new THREE.Vector3().copy(comet.start).lerp(comet.target, comet.progress);
      cometRef.current.position.lerp(targetPos, 0.1);
    }
  });
  if (comet.isDead) return null;
  return (
    <group ref={cometRef}>
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#fff"
          emissive="#fff"
          emissiveIntensity={1}
          roughness={0.1}
        />
      </mesh>
      <Trail
        width={1.5}
        length={3}
        color="#fff"
        segments={15}
        decay={2}
        blending={THREE.AdditiveBlending}
        target={cometRef}
        attenuation={(width) => width}
      />
    </group>
  );
}

/** Main mobile scene */
function SolarSystemMobileScene() {
  const [planetData, setPlanetData] = useState(initialPlanetDataMobile);
  const planetRefs = useRef({});
  const [comets, setComets] = useState([]);
  
  useEffect(() => {
    const int = setInterval(() => spawnRandomComet(), 15000);
    return () => clearInterval(int);
  }, []);
  
  useEffect(() => {
    const int = setInterval(() => {
      setComets((prev) => prev.filter((c) => !c.isDead));
    }, 500);
    return () => clearInterval(int);
  }, []);
  
  useFrame(() => {
    const names = Object.keys(planetData);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const A = names[i];
        const B = names[j];
        const refA = planetRefs.current[A];
        const refB = planetRefs.current[B];
        if (!refA || !refB) continue;
        const posA = refA.position;
        const posB = refB.position;
        const dist = posA.distanceTo(posB);
        const sumSize = planetData[A].size + planetData[B].size;
        if (dist < sumSize) {
          if (planetData[A].size < planetData[B].size) {
            reverseOrbit(A);
            refA.userData.handleCollision?.();
          } else if (planetData[B].size < planetData[A].size) {
            reverseOrbit(B);
            refB.userData.handleCollision?.();
          } else {
            reverseOrbit(A);
            reverseOrbit(B);
            refA.userData.handleCollision?.();
            refB.userData.handleCollision?.();
          }
        }
      }
    }
  });
  
  function reverseOrbit(name) {
    setPlanetData((prev) => {
      const copy = { ...prev[name] };
      copy.directionFactor *= -1;
      return { ...prev, [name]: copy };
    });
  }
  
  function spawnRandomComet() {
    const keys = Object.keys(planetData);
    const pick = keys[Math.floor(Math.random() * keys.length)];
    const planetRef = planetRefs.current[pick];
    if (!planetRef) return;
    const planetPos = planetRef.position.clone();
    const startPos = new THREE.Vector3(
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 300
    );
    const cometObj = {
      id: Math.random(),
      start: startPos,
      target: planetPos,
      progress: 0,
      speed: 0.002 + Math.random() * 0.003,
      isDead: false
    };
    setComets((prev) => [...prev, cometObj]);
  }
  
  function handleCometHit(comet) {
    setComets((prev) => prev.map((c) => (c.id === comet.id ? { ...c, isDead: true } : c)));
  }
  
  return (
    <>
      <OrbitingPlanetMobile
        name="Sun"
        data={{ isSun: true, radius: 0, speed: 0, size: 6, directionFactor: 1 }}
        decalFile={planetTextureMapMobile["Sun"]}
        bumpFile="generic-bump.png"
        ref={(el) => { if (el) planetRefs.current["Sun"] = el; }}
      />
      
      {Object.entries(planetData).map(([pName, pDat]) => (
        <OrbitingPlanetMobile
          key={pName}
          name={pName}
          data={pDat}
          decalFile={planetTextureMapMobile[pName]}
          bumpFile="generic-bump.png"
          ref={(el) => { if (el) planetRefs.current[pName] = el; }}
        />
      ))}
      
      {comets.map((c) => (
        <CometMobile key={c.id} comet={c} onHit={handleCometHit} />
      ))}
    </>
  );
}

/** Mobile focus camera */
function FocusCameraMobile({ target }) {
  const { camera } = useThree();
  useFrame(() => {
    if (target?.current) {
      const offsetPos = target.current.position.clone().add(new THREE.Vector3(0, 0, 8));
      camera.position.lerp(offsetPos, 0.05);
      camera.lookAt(target.current.position);
    }
  });
  return null;
}

export default function SolarSystemMobile() {
  const [focusedRef, setFocusedRef] = useState(null);
  const [inspectedPlanet, setInspectedPlanet] = useState(null);
  
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
        shadows
        camera={{ position: [0, 0, 130], fov: 50 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#000000', 50, 200]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#fff" />
          <Environment preset="dawn" />
          <Stars radius={200} depth={60} count={6000} factor={6} fade />
          
          <SolarSystemMobileScene />
          
          <FocusCameraMobile target={focusedRef} />
          
          <OrbitControls
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.2}
            minDistance={10}
            maxDistance={130}
          />
          
          <EffectComposer>
            <Bloom intensity={0.8} luminanceThreshold={0.3} luminanceSmoothing={0.6} />
            <DepthOfField focusDistance={0.005} focalLength={0.04} bokehScale={0.5} height={480} />
            <ChromaticAberration
              offset={new Vector2(0.0001, 0.0001)}
              radialModulation={true}
              modulationOffset={0.2}
              blendFunction={BlendFunction.NORMAL}
            />
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
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
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
