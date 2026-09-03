"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WaveMesh() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const geometryRef = React.useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (!geometryRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = geometryRef.current.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave1 = Math.sin(x * 0.3 + time * 0.4) * 0.3;
      const wave2 = Math.sin(y * 0.4 + time * 0.3) * 0.2;
      const wave3 = Math.sin((x + y) * 0.2 + time * 0.5) * 0.15;
      positions.setZ(i, wave1 + wave2 + wave3);
    }
    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-0.5, 0, 0]} position={[0, -1, -2]}>
      <planeGeometry ref={geometryRef} args={[16, 10, 64, 64]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

function FloatingOrbs() {
  const groupRef = React.useRef<THREE.Group>(null);

  const orbs = React.useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [
          (i - 2) * 2.5,
          Math.sin(i) * 1.5,
          -3 - Math.random() * 2,
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.4,
        speed: 0.2 + Math.random() * 0.3,
        color: ["#6366f1", "#818cf8", "#a5b4fc", "#3b82f6", "#8b5cf6"][i],
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      const time = state.clock.elapsedTime * orb.speed;
      child.position.y = orb.position[1] + Math.sin(time) * 0.5;
      child.position.x = orb.position[0] + Math.cos(time * 0.5) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={orb.color} transparent opacity={0.04} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <WaveMesh />
      <FloatingOrbs />
    </>
  );
}

export default function AnimatedBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      performance={{ min: 0.5 }}
    >
      <Scene />
    </Canvas>
  );
}
