"use client"
import React, { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231E293B"><rect width="100" height="100"/><circle cx="50" cy="40" r="20" fill="%237C3AED"/><path d="M20,90 C20,70 30,60 50,60 C70,60 80,70 80,90" fill="%237C3AED"/></svg>`

export interface ResilientImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
  isAvatar?: boolean
}

export default function ResilientImage({
  src,
  fallbackSrc,
  alt,
  isAvatar = false,
  ...props
}: ResilientImageProps) {
  const defaultFallback = isAvatar ? DEFAULT_AVATAR_SVG : "/logo-v2.jpg"
  const resolvedFallback = fallbackSrc || defaultFallback
  const [imgSrc, setImgSrc] = useState<any>(src)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <Image
      {...props}
      src={imgSrc || resolvedFallback}
      alt={alt || "Image"}
      onError={() => {
        // Fallback gracefully when remote load or Next.js optimization fails
        console.warn(`[ResilientImage] Failed to load ${src}. Falling back to default resource.`);
        setImgSrc(resolvedFallback)
      }}
    />
  )
}
