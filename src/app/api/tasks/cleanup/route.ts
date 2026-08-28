import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";
import { safeCompare } from"@/lib/security/crypto";

// This route can be called periodically by Vercel Cron.
export const maxDuration = 60; // 1 min max

export async function GET(req: Request) {
 try {
 const authHeader = req.headers.get("authorization");
 const url = new URL(req.url);
 const urlSecret = url.searchParams.get("secret");
 
 let isCronAuthorized = false;
 
 if (process.env.CRON_SECRET) {
 // Check Vercel Cron Auth Header (Bearer <CRON_SECRET>)
 if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
 isCronAuthorized = true;
 } 
 // Fallback to URL parameter
 else if (urlSecret && safeCompare(urlSecret, process.env.CRON_SECRET)) {
 isCronAuthorized = true;
 }
 }
 
 // If not a valid cron request, fallback to checking if it's an ADMIN user
 if (!isCronAuthorized) {
 const auth = await protectApi(["ADMIN"]);
 if (auth.errorResponse) {
 return NextResponse.json({ error:"Unauthorized cron agent" }, { status: 401 });
 }
 }

 // Calculate the threshold time: 1 hour ago
 const oneHourAgo = new Date();
 oneHourAgo.setHours(oneHourAgo.getHours() - 1);

 // 1. Clean up Gigs completed > 1 hour ago
 const deletedGigs = await prisma.gig.deleteMany({
 where: {
 status:"COMPLETED",
 completedAt: {
 lte: oneHourAgo,
 }
 }
 });

 // 2. Clean up Posts marked as completed > 1 hour ago
 const deletedPosts = await prisma.post.deleteMany({
 where: {
 status:"COMPLETED",
 completedAt: {
 lte: oneHourAgo,
 }
 }
 });

 return NextResponse.json({
 success: true,
 deletedCount: {
 gigs: deletedGigs.count,
 posts: deletedPosts.count
 },
 timestamp: new Date().toISOString()
 });
 } catch (error) {
 console.error("CRON_CLEANUP_ERROR:", error);
 return NextResponse.json({ error:"Failed to run automated cleanup system" }, { status: 500 });
 }
}
