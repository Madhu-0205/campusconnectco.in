"use client"

import { Float, Environment } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useEffect, useState } from "react"
import type { Mesh } from "three"

import { checkWebGL } from "@/lib/webgl"

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

function SceneCleanup() {
    const { gl } = useThree();

    useEffect(() => {
        return () => {
            // Force context loss on unmount to prevent "context lost" warnings (Requirement 6)
            const context = gl.getContext();
            if (context) {
                const extension = context.getExtension('WEBGL_lose_context');
                if (extension) extension.loseContext();
            }
            gl.dispose();
        };
    }, [gl]);

    return null;
}

export function Hero3D() {
    const [isMounted, setIsMounted] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasWebGL(checkWebGL());
         
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="absolute inset-0 -z-10 opacity-60 bg-linear-to-br from-indigo-50/10 to-pink-50/10" />
    }

    if (!hasWebGL) {
        return (
            <div className="absolute inset-0 -z-10 opacity-60 bg-linear-to-br from-indigo-50/20 to-pink-50/20" />
        );
    }

    return (
        <div className="absolute inset-0 -z-10 opacity-60">
            <Canvas camera={{ position: [0, 0, 8] }} dpr={[1, 2]}>
                <SceneCleanup />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <FloatingShape position={[-4, 2, 0]} color="#818cf8" />
                <FloatingShape position={[4, -2, -2]} color="#fb7185" />
                <FloatingShape position={[0, 0, -5]} color="#c4b5fd" />

                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
