"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment } from "@react-three/drei"
import { useRef } from "react"
import type { Mesh } from "three"

function FloatingShape({ position, color }: { position: [number, number, number], color: string }) {
    const meshRef = useRef<Mesh>(null!)

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 0.2
        meshRef.current.rotation.y += delta * 0.3
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
            </mesh>
        </Float>
    )
}

export function Hero3D() {
    return (
        <div className="absolute inset-0 -z-10 opacity-60">
            <Canvas camera={{ position: [0, 0, 8] }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <FloatingShape position={[-4, 2, 0]} color="#818cf8" /> {/* Primary */}
                <FloatingShape position={[4, -2, -2]} color="#fb7185" /> {/* Accent */}
                <FloatingShape position={[0, 0, -5]} color="#c4b5fd" /> {/* Secondary */}

                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
