/* eslint-disable react-hooks/refs */
"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, Grid, Float } from "@react-three/drei"
import * as THREE from "three"
import { checkWebGL } from "@/lib/webgl"

const STUDENT_CARDS = [
    { name: "Sneha R.", skill: "Poster Design", dist: "220m", price: "₹150", emoji: "🎨", pos: [-1.8, 0.4, 0.6] },
    { name: "Rahul K.", skill: "Web Dev", dist: "380m", price: "₹400", emoji: "💻", pos: [1.9, 0.6, -0.4] },
    { name: "Priya M.", skill: "Photography", dist: "500m", price: "₹300", emoji: "📸", pos: [-1.2, -0.4, -1.2] },
    { name: "Arjun S.", skill: "Notes/Tutoring", dist: "150m", price: "₹80", emoji: "📝", pos: [0.8, 0.8, 1.4] },
    { name: "Kiran V.", skill: "Arduino/ECE", dist: "430m", price: "₹250", emoji: "⚙️", pos: [0.0, -0.6, -1.6] },
]

// Animated concentric pulse rings
function PulseRings() {
    const COUNT = 3
    const meshRefs = useRef<(THREE.Mesh | null)[]>([])
    // Pre-create stable materials — one per ring — using brand primary light (violet)
    const matRefs = useRef<THREE.MeshBasicMaterial[]>(
        Array.from({ length: COUNT }, () =>
            new THREE.MeshBasicMaterial({
                color: new THREE.Color("#8B5CF6"),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
            })
        )
    )

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        for (let i = 0; i < COUNT; i++) {
            const mesh = meshRefs.current[i]
            const mat = matRefs.current[i]
            if (!mesh || !mat) continue
            const phase = (t * 0.5 + i * 0.7) % 3
            mesh.scale.setScalar(0.4 + phase * 0.5)
            mat.opacity = Math.max(0, 1 - phase / 3)
        }
    })

    return (
        <>
            {Array.from({ length: COUNT }, (_, i) => (
                <mesh
                    key={i}
                    ref={(el) => { meshRefs.current[i] = el }}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.01, 0]}
                    material={matRefs.current[i]}
                >
                    <ringGeometry args={[0.85, 0.9, 64]} />
                </mesh>
            ))}
        </>
    )
}

// Glowing center sphere (cyber cyan)
function CenterSphere() {
    const meshRef = useRef<THREE.Mesh>(null)
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.4
        }
    })

    return (
        <group position={[0, 0, 0]}>
            <pointLight color="#06B6D4" intensity={3} distance={5} />
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial
                    color="#06B6D4"
                    emissive="#06B6D4"
                    emissiveIntensity={1.8}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
            {/* Outer glow sphere */}
            <mesh>
                <sphereGeometry args={[0.38, 32, 32]} />
                <meshBasicMaterial color="#06B6D4" transparent opacity={0.08} />
            </mesh>
        </group>
    )
}

// Student card HTML overlay
function StudentCard({ data, index }: { data: typeof STUDENT_CARDS[0]; index: number }) {
    const [hovered, setHovered] = useState(false)

    return (
        <Float speed={1.5 + index * 0.3} floatIntensity={0.3} rotationIntensity={0.05}>
            <Html
                position={data.pos as [number, number, number]}
                center
                style={{ pointerEvents: "auto" }}
                zIndexRange={[10, 100]}
            >
                <div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        background: "rgba(13, 13, 26, 0.85)",
                        borderRadius: "16px",
                        padding: "12px 14px",
                        minWidth: "145px",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: hovered ? "0 0 24px rgba(6, 182, 212, 0.25)" : "var(--shadow-card)",
                        transform: hovered ? "scale(1.06)" : "scale(1)",
                        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                        cursor: "pointer",
                        border: hovered ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "20px" }}>{data.emoji}</span>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{data.name}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-2)", lineHeight: 1.2 }}>{data.skill}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span
                            style={{
                                fontSize: "9px",
                                background: "rgba(6,182,212,0.12)",
                                color: "var(--accent)",
                                padding: "2px 7px",
                                borderRadius: "20px",
                                fontWeight: 700,
                            }}
                        >
                            ● {data.dist}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--gold)", fontFamily: "var(--font-heading)" }}>
                            {data.price}
                        </span>
                    </div>
                    {hovered && (
                        <div
                            style={{
                                marginTop: "8px",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#fff",
                                background: "var(--grad-brand)",
                                borderRadius: "8px",
                                padding: "4px 0",
                                textAlign: "center",
                            }}
                        >
                            Hire →
                        </div>
                    )}
                </div>
            </Html>
        </Float>
    )
}

// Auto-orbit camera + mouse parallax
function SceneController() {
    const { camera } = useThree()
    const mouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener("mousemove", onMove, { passive: true })
        return () => window.removeEventListener("mousemove", onMove)
    }, [])

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        // Slow auto orbit
        const orbitRadius = 5
        const orbitX = Math.sin(t * 0.15) * orbitRadius
        const orbitZ = Math.cos(t * 0.15) * orbitRadius
        // Mouse parallax offset (±5°)
        const parallaxX = mouse.current.x * 0.4
        const parallaxY = mouse.current.y * 0.3
        camera.position.set(orbitX + parallaxX, 2 + parallaxY, orbitZ)
        camera.lookAt(0, 0, 0)
    })

    return null
}

export default function CampusMap3D() {
    const [isMounted, setIsMounted] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasWebGL(checkWebGL());
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div style={{ width: "100%", height: "480px", borderRadius: "24px", overflow: "hidden", background: "#080810", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{width: 40, height: 40, borderRadius: '50%', background: 'rgba(6,182,212,0.3)'}} className="animate-pulse" />
            </div>
        )
    }

    if (!hasWebGL) {
        return (
            <div style={{ width: "100%", height: "480px", borderRadius: "24px", overflow: "hidden", background: "#080810", position: "relative" }}>
                {/* CSS-only fallback map grid */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    transform: "perspective(1000px) rotateX(60deg) scale(2)",
                    transformOrigin: "top",
                    opacity: 0.6
                }} />
                
                {/* Central glowing pulse */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "120px",
                    height: "120px",
                    background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                    animation: "pulseRing 2s ease-out infinite"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "16px", height: "16px",
                        background: "#06B6D4",
                        borderRadius: "50%",
                        boxShadow: "0 0 24px rgba(6,182,212,0.8)"
                    }} />
                </div>

                {/* Text overlay */}
                <div style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "0",
                    width: "100%",
                    textAlign: "center",
                    color: "var(--text-3)",
                    fontSize: "12px",
                    fontWeight: 500
                }}>
                    Map running in low-power mode. (Enable Hardware Acceleration for 3D)
                </div>
            </div>
        )
    }

    return (
        <div style={{ width: "100%", height: "480px", borderRadius: "24px", overflow: "hidden", background: "#080810" }}>
            <Canvas
                camera={{ position: [0, 3, 5], fov: 50 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 8, 5]} intensity={0.6} color="#ffffff" />

                {/* Grid floor */}
                <Grid
                    args={[20, 20]}
                    position={[0, -0.5, 0]}
                    cellSize={1}
                    cellThickness={0.5}
                    sectionSize={4}
                    sectionThickness={1}
                    cellColor="#1c1c30"
                    sectionColor="#3b1d60"
                    fadeDistance={14}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid
                />

                {/* Fog */}
                <fog attach="fog" args={["#080810", 8, 20]} />

                {/* Scene elements */}
                <PulseRings />
                <CenterSphere />
                {STUDENT_CARDS.map((card, i) => (
                    <StudentCard key={i} data={card} index={i} />
                ))}

                <SceneController />
            </Canvas>
        </div>
    )
}

