/**
 * Generates an initials-based inline SVG Data URI locally.
 * Bypasses network requests and Next.js server-side image optimization timeouts.
 */
export function getLocalAvatar(name: string, background = "7C3AED"): string {
  // Extract initials (up to 2 letters)
  const initials = name
    .trim()
    .split(/[\s+]+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Construct local SVG string with Syne or sans-serif font
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#${background}">
    <rect width="100" height="100" rx="24"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="800" fill="#ffffff">${initials}</text>
  </svg>`;

  // Encode the SVG for data URI compatibility
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
