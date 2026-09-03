"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const GLOBE_RADIUS = 2;

const CITIES = [
  { lat: 40.7, lng: -74.0, color: "#f97316" },
  { lat: 51.5, lng: -0.1, color: "#3b82f6" },
  { lat: 48.9, lng: 2.3, color: "#3b82f6" },
  { lat: 35.7, lng: 139.7, color: "#ef4444" },
  { lat: 1.3, lng: 103.8, color: "#10b981" },
  { lat: -33.9, lng: 151.2, color: "#f59e0b" },
  { lat: 37.8, lng: -122.4, color: "#f97316" },
  { lat: 25.2, lng: 55.3, color: "#8b5cf6" },
  { lat: 19.1, lng: 72.9, color: "#10b981" },
  { lat: -23.5, lng: -46.6, color: "#ec4899" },
  { lat: 52.5, lng: 13.4, color: "#3b82f6" },
  { lat: 34.1, lng: -118.2, color: "#f97316" },
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 6], [1, 2], [1, 10], [2, 7], [3, 4],
  [3, 6], [4, 5], [4, 8], [7, 8], [11, 3], [9, 0],
];

function latLngToVec3(lat: number, lng: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

/* ---- Procedural Earth Texture ---- */
function createEarthTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Ocean gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#1e3a5f");
  gradient.addColorStop(0.3, "#1e40af");
  gradient.addColorStop(0.5, "#2563eb");
  gradient.addColorStop(0.7, "#1e40af");
  gradient.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Landmasses (simplified continents)
  ctx.fillStyle = "#16a34a";
  const continents = [
    // North America
    { x: 80, y: 100, w: 90, h: 80 },
    // South America
    { x: 120, y: 220, w: 50, h: 100 },
    // Europe
    { x: 240, y: 90, w: 50, h: 50 },
    // Africa
    { x: 250, y: 160, w: 60, h: 110 },
    // Asia
    { x: 300, y: 80, w: 120, h: 100 },
    // Australia
    { x: 380, y: 280, w: 50, h: 40 },
  ];

  continents.forEach((c) => {
    ctx.beginPath();
    ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Add some terrain variation
  ctx.fillStyle = "#15803d";
  continents.forEach((c) => {
    ctx.beginPath();
    ctx.ellipse(c.x + c.w / 2 + 5, c.y + c.h / 2 + 5, c.w / 3, c.h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Desert areas
  ctx.fillStyle = "#ca8a04";
  ctx.beginPath();
  ctx.ellipse(270, 170, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(340, 140, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Polar ice caps
  ctx.fillStyle = "#e0f2fe";
  ctx.fillRect(0, 0, size, 25);
  ctx.fillRect(0, size - 25, size, 25);

  // Cloud-like wisps
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 0; i < 30; i++) {
    const cx = (i * 73 + 20) % size;
    const cy = (i * 47 + 30) % size;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 15 + (i % 10), 5 + (i % 5), (i * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ---- Camera Rig ---- */
function CameraRig() {
  const { camera } = useThree();
  const mouse = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.2 + 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ---- Colorful Earth Globe ---- */
function Globe() {
  const ref = React.useRef<THREE.Group>(null);
  const texture = React.useMemo(() => createEarthTexture(), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Earth sphere with procedural texture */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.05, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.12, 24, 24]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* ---- City Dots ---- */
function CityDots() {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  const positions = React.useMemo(
    () => CITIES.map((c) => latLngToVec3(c.lat, c.lng, GLOBE_RADIUS + 0.02)),
    []
  );

  useFrame((state) => {
    if (!ref.current) return;
    positions.forEach((pos, i) => {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CITIES.length]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
    </instancedMesh>
  );
}

/* ---- Arc Connections ---- */
function Arcs() {
  const ref = React.useRef<THREE.Group>(null);

  const curves = React.useMemo(() => {
    return CONNECTIONS.map(([a, b]) => {
      const start = new THREE.Vector3(...latLngToVec3(CITIES[a].lat, CITIES[a].lng, GLOBE_RADIUS + 0.02));
      const end = new THREE.Vector3(...latLngToVec3(CITIES[b].lat, CITIES[b].lng, GLOBE_RADIUS + 0.02));
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.2);
      return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(20);
    });
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
    });
  });

  return (
    <group ref={ref}>
      {curves.map((pts, i) => (
        <line key={i}>
          <bufferGeometry setFromPoints={[pts]} />
          <lineBasicMaterial color={CITIES[CONNECTIONS[i][0]].color} transparent opacity={0.25} />
        </line>
      ))}
    </group>
  );
}

/* ---- Scene ---- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={0.2} color="#6366f1" />
      <CameraRig />
      <group rotation={[0.1, 0, 0]}>
        <Globe />
        <CityDots />
        <Arcs />
      </group>
    </>
  );
}

/* ---- Exported Component ---- */
export default function IntelligenceNetwork3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      performance={{ min: 0.5 }}
    >
      <Scene />
    </Canvas>
  );
}
