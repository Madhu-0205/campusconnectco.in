"use client";
import { motion } from"framer-motion";

export function GlobalBackground() {
 return (
 <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-white var(--surface)] transition-colors duration-500">
 {/* SaaS Mesh Grid */}
 <div className="absolute inset-0 mesh-grid opacity-20" />
 
 {/* Dynamic Orbs */}
 <motion.div
 animate={{
 translateX: [0, 20, 0],
 translateY: [0, -20, 0],
 translateZ: 0,
 scale: [1, 1.1, 1],
 opacity: [0.15, 0.2, 0.15],
 }}
 transition={{
 duration: 15,
 repeat: Infinity,
 repeatType:"reverse",
 }}
 className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply"
 />
 <motion.div
 animate={{
 translateX: [0, -30, 0],
 translateY: [0, 30, 0],
 translateZ: 0,
 scale: [1, 1.2, 1],
 opacity: [0.1, 0.15, 0.1],
 }}
 transition={{
 duration: 20,
 repeat: Infinity,
 repeatType:"reverse",
 }}
 className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-primary/15 blur-[120px] rounded-full mix-blend-multiply"
 />
 </div>
 );
}
