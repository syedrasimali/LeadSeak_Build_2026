"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function ParticleField({ count }: { count: number }) {
  const pointsRef = React.useRef<THREE.Points>(null);

  const [positions, speeds] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      spd[i] = 0.002 + Math.random() * 0.005;
    }
    return [pos, spd];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 10) {
        arr[i * 3 + 1] = -10;
        arr[i * 3] = (Math.random() - 0.5) * 20;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#3478ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function FloatingGrid() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const elapsed = React.useRef(0);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    elapsed.current += delta;
    const time = elapsed.current;
    meshRef.current.rotation.x = -0.4 + Math.sin(time * 0.1) * 0.02;
    meshRef.current.position.y = -2 + Math.sin(time * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, -2, -3]}>
      <planeGeometry args={[30, 30, 30, 30]} />
      <meshBasicMaterial
        color="#3478ff"
        wireframe
        transparent
        opacity={0.04}
      />
    </mesh>
  );
}

function GlowOrbs({ count }: { count: number }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const elapsed = React.useRef(0);

  const orbs = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [
          (i - (count - 1) / 2) * 4,
          Math.sin(i * 1.5) * 2,
          -4 - Math.random() * 2,
        ] as [number, number, number],
        scale: 0.8 + Math.random() * 0.6,
        speed: 0.15 + Math.random() * 0.2,
        color: ["#3478ff", "#5a6cff", "#3478ff", "#5a6cff"][i % 4],
      })),
    [count]
  );

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const time = elapsed.current;
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      if (!orb) return;
      child.position.y = orb.position[1] + Math.sin(time * orb.speed) * 0.8;
      child.position.x = orb.position[0] + Math.cos(time * orb.speed * 0.7) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={orb.color} transparent opacity={0.03} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const particleCount = isMobile ? 200 : 800;
  const orbCount = isMobile ? 2 : 4;

  return (
    <>
      <ambientLight intensity={0.2} />
      <ParticleField count={particleCount} />
      <FloatingGrid />
      <GlowOrbs count={orbCount} />
    </>
  );
}

export function ThreeBackground({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  if (reduced) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5 }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
