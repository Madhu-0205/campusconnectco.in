const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1s

export async function fetchWithBackoff(
 input: RequestInfo | URL,
 init?: RequestInit,
 retries = MAX_RETRIES,
 delay = INITIAL_DELAY
): Promise<Response> {
 // 1. Client-side offline check: reject instantly to prevent network error spam
 if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) {
 throw new TypeError('Network request failed: Device is offline');
 }

 try {
 const response = await fetch(input, init);
 
 // 2. Retry on transient server errors (5xx) or rate limit status (429)
 if (retries > 0 && (response.status >= 500 || response.status === 429)) {
 if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) {
 throw new TypeError('Network request failed: Device went offline');
 }
 
 if (process.env.NODE_ENV === 'development') {
 console.warn(`[Supabase Fetch] Status ${response.status}. Retrying in ${delay}ms... (${retries} attempts left)`);
 }
 
 await new Promise(resolve => setTimeout(resolve, delay));
 return fetchWithBackoff(input, init, retries - 1, delay * 2);
 }
 
 return response;
 } catch (error) {
 // 3. Retry on core fetch network errors (DNS failures, connection resets)
 if (retries > 0) {
 if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) {
 throw new TypeError('Network request failed: Device went offline');
 }
 
 if (process.env.NODE_ENV === 'development') {
 console.warn(`[Supabase Fetch] Connection failed: ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay}ms... (${retries} attempts left)`);
 }
 
 await new Promise(resolve => setTimeout(resolve, delay));
 return fetchWithBackoff(input, init, retries - 1, delay * 2);
 }
 throw error;
 }
}
