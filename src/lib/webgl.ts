/* webgl.ts - WebGL detection utility */
let cachedHasWebGL: boolean | null = null;

export function checkWebGL(): boolean {
 if (typeof window === 'undefined') return false;
 if (cachedHasWebGL !== null) return cachedHasWebGL;
 try {
 const canvas = document.createElement('canvas');
 const gl = window.WebGL2RenderingContext ? canvas.getContext('webgl2') : null;
 const fallbackGl = window.WebGLRenderingContext && (
 gl || 
 canvas.getContext('webgl') || 
 canvas.getContext('experimental-webgl')
 );
 cachedHasWebGL = !!fallbackGl;
 } catch {
 cachedHasWebGL = false;
 }
 return cachedHasWebGL;
}
