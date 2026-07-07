import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const ROOM = { w: 30, d: 18, h: 5.5 };
const WAINSCOT_H = 1.1;

function Room() {
  return (
    <group>
      <Floor />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.h, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#f6efe0" roughness={0.85} />
      </mesh>
      <CeilingTrim />
      <WallPanel position={[0, ROOM.h / 2, -ROOM.d / 2]} rotation={[0, 0, 0]} w={ROOM.w} />
      <WallPanel position={[0, ROOM.h / 2, ROOM.d / 2]} rotation={[0, Math.PI, 0]} w={ROOM.w} />
      <WallPanel position={[-ROOM.w / 2, ROOM.h / 2, 0]} rotation={[0, Math.PI / 2, 0]} w={ROOM.d} />
      <WallPanel position={[ROOM.w / 2, ROOM.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} w={ROOM.d} />
      <Bench />
      <Chandelier />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[3.2, ROOM.d - 2]} />
        <meshStandardMaterial color="#3a1e1a" roughness={0.95} />
      </mesh>
    </group>
  );
}

function WallPanel({ position, rotation, w }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, WAINSCOT_H / 2, 0]} receiveShadow>
        <planeGeometry args={[w, ROOM.h - WAINSCOT_H]} />
        <meshStandardMaterial color="#efe6d2" roughness={0.95} />
      </mesh>
      <mesh position={[0, -ROOM.h / 2 + WAINSCOT_H / 2, 0.005]} receiveShadow>
        <planeGeometry args={[w, WAINSCOT_H]} />
        <meshStandardMaterial color="#d9cdb2" roughness={0.85} />
      </mesh>
      <mesh position={[0, -ROOM.h / 2 + WAINSCOT_H, 0.02]}>
        <boxGeometry args={[w, 0.04, 0.04]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.4} metalness={0.85} />
      </mesh>
      <mesh position={[0, -ROOM.h / 2 + 0.08, 0.03]}>
        <boxGeometry args={[w, 0.16, 0.06]} />
        <meshStandardMaterial color="#1a120b" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Floor() {
  const plankCount = 20;
  const plankW = ROOM.w / plankCount;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#5a3a24" roughness={0.4} metalness={0.1} />
      </mesh>
      {Array.from({ length: plankCount - 1 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-ROOM.w / 2 + (i + 1) * plankW, 0.002, 0]}>
          <planeGeometry args={[0.02, ROOM.d]} />
          <meshStandardMaterial color="#1a0f08" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function CeilingTrim() {
  const y = ROOM.h - 0.03;
  return (
    <group>
      <mesh position={[0, y, -ROOM.d / 2 + 0.05]}>
        <boxGeometry args={[ROOM.w, 0.06, 0.1]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.4} metalness={0.75} />
      </mesh>
      <mesh position={[0, y, ROOM.d / 2 - 0.05]}>
        <boxGeometry args={[ROOM.w, 0.06, 0.1]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.4} metalness={0.75} />
      </mesh>
      <mesh position={[-ROOM.w / 2 + 0.05, y, 0]}>
        <boxGeometry args={[0.1, 0.06, ROOM.d]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.4} metalness={0.75} />
      </mesh>
      <mesh position={[ROOM.w / 2 - 0.05, y, 0]}>
        <boxGeometry args={[0.1, 0.06, ROOM.d]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.4} metalness={0.75} />
      </mesh>
    </group>
  );
}

function Bench() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 0.7]} />
        <meshStandardMaterial color="#141821" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.35, 0.04, 0.66]} />
        <meshStandardMaterial color="#22283a" roughness={0.85} />
      </mesh>
      {[[-1.05, 0.21, -0.28],[1.05, 0.21, -0.28],[-1.05, 0.21, 0.28],[1.05, 0.21, 0.28]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
          <meshStandardMaterial color="#c9a24a" roughness={0.35} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Chandelier() {
  return (
    <group position={[0, ROOM.h - 0.4, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 16, 48]} />
        <meshStandardMaterial color="#c9a24a" roughness={0.3} metalness={0.9} emissive="#3a2a10" emissiveIntensity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#fff2d6" emissive="#ffd28a" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.1, 0]} intensity={28} distance={20} color="#ffdca8" />
    </group>
  );
}

function buildSlots(count) {
  const eye = 1.9;
  const inset = 0.06;
  const walls = [
    { len: ROOM.w, make: (t) => ({ position: [(-ROOM.w / 2) + t * ROOM.w, eye, -ROOM.d / 2 + inset], rotationY: 0, normal: [0, 0, 1] }) },
    { len: ROOM.d, make: (t) => ({ position: [ROOM.w / 2 - inset, eye, (-ROOM.d / 2) + t * ROOM.d], rotationY: -Math.PI / 2, normal: [-1, 0, 0] }) },
    { len: ROOM.w, make: (t) => ({ position: [(ROOM.w / 2) - t * ROOM.w, eye, ROOM.d / 2 - inset], rotationY: Math.PI, normal: [0, 0, -1] }) },
    { len: ROOM.d, make: (t) => ({ position: [-ROOM.w / 2 + inset, eye, (ROOM.d / 2) - t * ROOM.d], rotationY: Math.PI / 2, normal: [1, 0, 0] }) },
  ];
  const perimeter = walls.reduce((s, w) => s + w.len, 0);
  const slots = [];
  let assigned = 0;
  walls.forEach((w, i) => {
    const share = i === walls.length - 1 ? count - assigned : Math.round((w.len / perimeter) * count);
    assigned += share;
    for (let k = 0; k < share; k++) {
      const t = (k + 1) / (share + 1);
      slots.push(w.make(t));
    }
  });
  return slots;
}

function PaintingFrame({ painting, slot, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <Suspense fallback={<FramePlaceholder />}>
        <PaintingMesh painting={painting} highlight={active || hovered} onClick={onClick} onOver={setHovered} />
      </Suspense>
      <spotLight
        position={[0, 2.2, 1.6]}
        angle={0.42}
        penumbra={0.75}
        intensity={22}
        distance={9}
        color="#ffe6b8"
        target-position={[0, 0, 0]}
        castShadow={false}
      />
      <group position={[0, -1.45, 0.06]}>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[1.3, 0.34]} />
          <meshStandardMaterial color="#c9a24a" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh>
          <planeGeometry args={[1.22, 0.28]} />
          <meshStandardMaterial color="#f6ecd3" roughness={0.85} />
        </mesh>
        <Html
          transform
          occlude={false}
          distanceFactor={2.2}
          position={[0, 0, 0.01]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{ width: 260, textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1c1c1c' }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.4, fontStyle: 'italic' }}>{painting.title}</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, letterSpacing: 1.8, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
              {painting.artist}
              {painting.year ? ` - ${painting.year}` : ''}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

function FramePlaceholder() {
  return (
    <mesh>
      <planeGeometry args={[1.6, 2.0]} />
      <meshStandardMaterial color="#2a1f16" />
    </mesh>
  );
}

function PaintingMesh({ painting, highlight, onClick, onOver }) {
  const tex = useTexture(painting.imageUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const img = tex.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.8;
  const maxH = 2.0;
  const maxW = 2.6;
  let h = maxH;
  let w = maxH * aspect;
  if (w > maxW) {
    w = maxW;
    h = maxW / aspect;
  }

  const frameThickness = 0.09;
  const frameDepth = 0.08;
  const outerColor = highlight ? '#d9b23a' : '#221610';
  const linerColor = highlight ? '#f0c86a' : '#8a6a2a';

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onOver(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onOver(false);
        document.body.style.cursor = '';
      }}
    >
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w + frameThickness * 2, h + frameThickness * 2, frameDepth]} />
        <meshStandardMaterial color={outerColor} roughness={0.55} metalness={highlight ? 0.5 : 0.15} />
      </mesh>
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[w + 0.05, h + 0.05]} />
        <meshStandardMaterial color={linerColor} roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, frameDepth / 2 + 0.003]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
      {highlight && (
        <mesh position={[0, 0, frameDepth / 2 + 0.004]}>
          <planeGeometry args={[w + 0.4, h + 0.4]} />
          <meshBasicMaterial color="#f0c86a" transparent opacity={0.14} />
        </mesh>
      )}
    </group>
  );
}

function FPSController({ onNearest, paintingPositions }) {
  const { camera } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    const dn = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = (keys.current.ShiftLeft || keys.current.ShiftRight ? 9 : 4.2) * delta;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

    velocity.current.set(0, 0, 0);
    if (keys.current.KeyW || keys.current.ArrowUp) velocity.current.add(forward);
    if (keys.current.KeyS || keys.current.ArrowDown) velocity.current.sub(forward);
    if (keys.current.KeyD || keys.current.ArrowRight) velocity.current.add(right);
    if (keys.current.KeyA || keys.current.ArrowLeft) velocity.current.sub(right);

    if (velocity.current.lengthSq() > 0) {
      velocity.current.normalize().multiplyScalar(speed);
      camera.position.add(velocity.current);
    }
    camera.position.y = 1.7;
    const pad = 0.8;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -ROOM.w / 2 + pad, ROOM.w / 2 - pad);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -ROOM.d / 2 + pad, ROOM.d / 2 - pad);

    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < paintingPositions.length; i++) {
      const d = camera.position.distanceTo(paintingPositions[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && bestDist < 3.8) {
      onNearest({ index: bestIdx, distance: bestDist });
    } else {
      onNearest(null);
    }
  });

  return <PointerLockControls />;
}

export function MuseumScene({ paintings, onSelect, onNearestChange }) {
  const slots = useMemo(() => buildSlots(paintings.length), [paintings.length]);
  const positions = useMemo(() => slots.map((s) => new THREE.Vector3(s.position[0], s.position[1], s.position[2])), [slots]);
  const nearestIdxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'KeyE' && nearestIdxRef.current !== null) {
        onSelect(paintings[nearestIdxRef.current]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paintings, onSelect]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.7, ROOM.d / 2 - 2], fov: 70, near: 0.1, far: 200 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={['#0a0d18']} />
      <fog attach="fog" args={['#0a0d18', 18, 46]} />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>
      <ambientLight intensity={0.28} color="#fff2d6" />
      <hemisphereLight args={['#fff2d6', '#2a1f16', 0.35]} />
      <pointLight position={[-10, ROOM.h - 0.5, 0]} intensity={16} distance={12} color="#ffdca8" />
      <pointLight position={[10, ROOM.h - 0.5, 0]} intensity={16} distance={12} color="#ffdca8" />

      <Room />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={ROOM.w} blur={2.4} far={4} />

      {paintings.map((p, i) => (
        <PaintingFrameWithProximity
          key={p.id}
          painting={p}
          slot={slots[i]}
          index={i}
          nearestIdxRef={nearestIdxRef}
          onClick={() => onSelect(p)}
        />
      ))}

      <FPSController
        paintingPositions={positions}
        onNearest={(n) => {
          const idx = n?.index ?? null;
          nearestIdxRef.current = idx;
          onNearestChange(idx !== null ? paintings[idx] : null);
        }}
      />
    </Canvas>
  );
}

function PaintingFrameWithProximity({ painting, slot, index, nearestIdxRef, onClick }) {
  const [active, setActive] = useState(false);
  useFrame(() => {
    const isNear = nearestIdxRef.current === index;
    if (isNear !== active) setActive(isNear);
  });
  return <PaintingFrame painting={painting} slot={slot} active={active} onClick={onClick} />;
}
