import { describe, it, expect } from"vitest";

import { generateEmbedding, cosineSimilarity, findTopN, Candidate } from"../lib/ai/embeddings";

describe("AI Embeddings and Matching", () => {
 it("should generate deterministic fallback embedding for placeholders", async () => {
 // Save current env and force placeholder mode
 const originalKey = process.env.OPENAI_API_KEY;
 process.env.OPENAI_API_KEY ="placeholder_key";

 try {
 const text1 ="React and TypeScript developer";
 const text2 ="React and TypeScript developer";
 const text3 ="Python data scientist";

 const embedding1 = await generateEmbedding(text1);
 const embedding2 = await generateEmbedding(text2);
 const embedding3 = await generateEmbedding(text3);

 // Verify shape and type
 expect(Array.isArray(embedding1)).toBe(true);
 expect(embedding1.length).toBe(1536); // Default dimensions

 // Deterministic check
 expect(embedding1).toEqual(embedding2);
 expect(embedding1).not.toEqual(embedding3);

 // Norm validation (unit vectors)
 const magnitude = Math.sqrt(embedding1.reduce((sum, v) => sum + v * v, 0));
 expect(magnitude).toBeCloseTo(1.0, 5);
 } finally {
 process.env.OPENAI_API_KEY = originalKey;
 }
 });

 it("should calculate correct cosine similarity", () => {
 const vecA = [1, 0, 0];
 const vecB = [1, 0, 0];
 const vecC = [0, 1, 0];
 const vecD = [-1, 0, 0];

 expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 5); // Identical
 expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 5); // Orthogonal
 expect(cosineSimilarity(vecA, vecD)).toBeCloseTo(-1.0, 5); // Opposite
 });

 it("should rank candidates correctly using findTopN", () => {
 const query = [1, 0, 0];
 const candidates: Candidate[] = [
 { id:"cand1", vector: [0.1, 0.9, 0] },
 { id:"cand2", vector: [0.9, 0.1, 0] },
 { id:"cand3", vector: [0.5, 0.5, 0] },
 ];

 // Find top 2
 const results = findTopN(query, candidates, 2);

 expect(results.length).toBe(2);
 expect(results[0].id).toBe("cand2"); // Highest similarity (~0.99)
 expect(results[1].id).toBe("cand3"); // Second highest (~0.7)
 });

 it("should apply boosting function in findTopN ranking", () => {
 const query = [1, 0, 0];
 const candidates: Candidate[] = [
 { id:"cand1", vector: [0.9, 0, 0], boostVal: 0.0 }, // Similarity: 0.9 + 0 = 0.9
 { id:"cand2", vector: [0.8, 0, 0], boostVal: 0.3 }, // Similarity: 0.8 + 0.3 = 1.1
 ];

 const boostFn = (cand: Candidate): number => {
 return cand.boostVal || 0;
 };

 const results = findTopN(query, candidates, 2, boostFn);

 expect(results[0].id).toBe("cand2"); // cand2 has lower base score but boosted to top
 });
});
