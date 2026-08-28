import crypto from 'crypto';

import prisma from '@/lib/prisma';

import { getOpenAI } from './client';

export async function generateEmbedding(text: string): Promise<number[]> {
 const apiKey = process.env.OPENAI_API_KEY ||"";
 const isGroq = apiKey.startsWith("gsk_");
 const isPlaceholder = apiKey ==="" || apiKey.includes("placeholder") || apiKey.includes("your_openai");
 
 const model = isGroq ? 'nomic-embed-text-v1.5' : (process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small');
 const dimensions = isGroq ? 768 : 1536;

 if (isPlaceholder) {
 return generateHashFallback(text, dimensions);
 }

 const maxRetries = 3;
 let delay = 1000;
 
 for (let i = 0; i < maxRetries; i++) {
 try {
 const openai = getOpenAI();
 const response = await openai.embeddings.create({
 model: model,
 input: text,
 encoding_format:"float",
 });
 return response.data[0].embedding;
 } catch (error: any) {
 if (error?.status === 429 && i < maxRetries - 1) {
 await new Promise(r => setTimeout(r, delay));
 delay *= 2;
 continue;
 }
 console.error(`[AI Embeddings] API call failed on attempt ${i + 1}:`, error);
 }
 }
 
 console.warn(`[AI Embeddings] API calls exhausted. Falling back to hash-based vector.`);
 return generateHashFallback(text, dimensions);
}

function generateHashFallback(text: string, dimensions: number): number[] {
 const vector = new Array(dimensions).fill(0);
 for (let i = 0; i < text.length; i++) {
 const charCode = text.charCodeAt(i);
 const index = (charCode * (i + 1)) % dimensions;
 vector[index] = (vector[index] + charCode / 127 - 1);
 }
 let magnitude = 0;
 for (let i = 0; i < dimensions; i++) {
 magnitude += vector[i] * vector[i];
 }
 magnitude = Math.sqrt(magnitude);
 if (magnitude > 0) {
 for (let i = 0; i < dimensions; i++) {
 vector[i] /= magnitude;
 }
 } else {
 vector[0] = 1.0;
 }
 return vector;
}

function computeHash(text: string): string {
 return crypto.createHash('sha256').update(text).digest('hex');
}

export async function computeUserEmbedding(userId: string) {
 const user = await prisma.user.findUnique({
 where: { id: userId },
 include: { projects: true, savedInternships: { include: { internship: true } } }
 });
 if (!user) throw new Error("User not found");

 const resumeData: any = (user as any).resumeData || {};
 
 const elements = [
 `${user.name || 'User'} is a ${resumeData.experienceLevel || user.year || 'student'} student at ${user.college || 'university'} studying ${user.branch || 'their field'}.`,
 `Skills: ${user.skills || ''}`,
 `Tools: ${(resumeData.tools || []).join(', ')}`,
 `Projects: ${user.projects.map((p: any) => p.title + ' - ' + (p.description || '')).join(' | ')}`,
 `Looking for: ${user.careerGoal || ''}`,
 `Keywords: ${(resumeData.keywords || []).join(', ')}`,
 `Saved internships: ${user.savedInternships.map((s: any) => s.internship.title).join(', ')}`
 ];

 const richText = elements.join('\\n').trim();
 const hash = computeHash(richText);

 const existing = await prisma.userEmbedding.findUnique({ where: { userId } });
 if (existing && existing.hash === hash) {
 return existing.vector as number[];
 }

 const vector = await generateEmbedding(richText);

 await prisma.userEmbedding.upsert({
 where: { userId },
 update: { hash, vector },
 create: { userId, hash, vector }
 });

 return vector;
}

export async function computeGigEmbedding(gigId: string) {
 const gig = await prisma.gig.findUnique({ where: { id: gigId } });
 if (!gig) throw new Error("Gig not found");

 const skillsRequired = typeof gig.required_skills === 'string' ? gig.required_skills : JSON.stringify(gig.required_skills || '');

 const elements = [
 `${gig.title}. ${gig.description}`,
 `Skills needed: ${skillsRequired}`,
 `Category: ${gig.tags || 'General'}`,
 `Level: Student`,
 `Budget: ${gig.budget}`
 ];

 const richText = elements.join('\\n').trim();
 const hash = computeHash(richText);

 const existing = await prisma.gigEmbedding.findUnique({ where: { gigId } });
 if (existing && existing.hash === hash) {
 return existing.vector as number[];
 }

 const vector = await generateEmbedding(richText);

 await prisma.gigEmbedding.upsert({
 where: { gigId },
 update: { hash, vector },
 create: { gigId, hash, vector }
 });

 return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
 if (a.length !== b.length) return 0;
 let dotProduct = 0;
 let normA = 0;
 let normB = 0;
 for (let i = 0; i < a.length; i++) {
 dotProduct += a[i] * b[i];
 normA += a[i] * a[i];
 normB += b[i] * b[i];
 }
 if (normA === 0 || normB === 0) return 0;
 return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface Candidate {
 id: string;
 vector?: number[];
 score?: number;
 // other fields required for boost context
 [key: string]: any;
}

export function findTopN(queryVector: number[], candidates: Candidate[], n: number, boostFn?: (candidate: Candidate, baseScore: number) => number): Candidate[] {
 const ranked = candidates.map(c => {
 let baseScore = 0;
 if (c.vector) {
 baseScore = cosineSimilarity(queryVector, c.vector);
 }
 let finalScore = baseScore;
 if (boostFn) {
 finalScore += boostFn(c, baseScore);
 }
 return { ...c, score: finalScore };
 });

 return ranked.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, n);
}
