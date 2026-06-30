"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
    return (
        <Sonner
            position="top-center"
            richColors
            closeButton
            theme="light"
            toastOptions={{
                className: 'glass font-sans',
                style: {
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '16px',
                }
            }}
        />
    )
}
