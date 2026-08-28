export class RateLimiter {
 private requests: Map<string, number[]> = new Map();
 private readonly windowMs: number;
 private readonly maxRequests: number;
 private readonly name: string;

 constructor(windowMs: number, maxRequests: number, name ="general") {
 this.windowMs = windowMs;
 this.maxRequests = maxRequests;
 this.name = name;
 }

 public async check(ip: string): Promise<boolean> {
 const url = process.env.UPSTASH_REDIS_REST_URL;
 const token = process.env.UPSTASH_REDIS_REST_TOKEN;

 if (url && token) {
 try {
 const key = `ratelimit:${this.name}:${ip}`;
 const windowSeconds = Math.ceil(this.windowMs / 1000);
 const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 1500);

 const response = await fetch(`${baseUrl}/pipeline`, {
 method: 'POST',
 signal: controller.signal,
 headers: {
 Authorization: `Bearer ${token}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify([
 ['INCR', key],
 ['EXPIRE', key, windowSeconds],
 ]),
 });
 clearTimeout(timeoutId);

 if (response.ok) {
 const result = await response.json();
 if (Array.isArray(result) && result[0] && typeof result[0].result === 'number') {
 const count = result[0].result;
 const effectiveMax = process.env.NODE_ENV === 'development' ? this.maxRequests * 100 : this.maxRequests;
 return count <= effectiveMax;
 }
 }
 } catch (error) {
 console.error(`[RateLimiter] Distributed check failed, falling back to memory:`, error);
 }
 }

 const now = Date.now();
 const windowStart = now - this.windowMs;

 let timestamps = this.requests.get(ip) || [];
 timestamps = timestamps.filter(t => t > windowStart);

 const effectiveMax = process.env.NODE_ENV === 'development' ? this.maxRequests * 100 : this.maxRequests;

 if (timestamps.length >= effectiveMax) {
 this.requests.set(ip, timestamps);
 return false;
 }

 timestamps.push(now);
 this.requests.set(ip, timestamps);
 
 if (this.requests.size > 1000 || Math.random() < 0.05) {
 for (const [key, times] of Array.from(this.requests.entries())) {
 const activeTimes = times.filter(t => t > windowStart);
 if (activeTimes.length === 0) {
 this.requests.delete(key);
 } else {
 this.requests.set(key, activeTimes);
 }
 }
 }
 
 return true;
 }
}

// Global Instances
export const authLimiter = new RateLimiter(60 * 1000, 10,"auth");
export const generalApiLimiter = new RateLimiter(15 * 60 * 1000, 100,"general");
export const aiLimiter = new RateLimiter(10 * 60 * 1000, 20,"ai");
export const resumeParseLimiter = new RateLimiter(24 * 60 * 60 * 1000, 3,"resume");
export const searchLimiter = new RateLimiter(5 * 60 * 1000, 30,"search");
export const uploadLimiter = new RateLimiter(60 * 1000, 5,"upload");

