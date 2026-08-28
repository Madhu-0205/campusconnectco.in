import prisma from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";

export type ResourceType = 'transaction' | 'gig' | 'post' | 'dispute';
export type RequiredRole = 'owner' | 'participant' | 'admin';

/**
 * Verifies if a user has the required permissions for a specific resource.
 * This prevents IDOR (Insecure Direct Object Reference) attacks.
 */
export async function verifyResourceOwnership(
 userId: string,
 resourceType: ResourceType,
 resourceId: string,
 requiredRole: RequiredRole = 'owner'
): Promise<boolean> {
 try {
 // 1. Check if user is Admin/Founder (they can access everything)
 const userProfile = await prisma.user.findUnique({ where: { id: userId } });
 if (userProfile?.role === 'ADMIN' || userProfile?.role === 'FOUNDER') {
 return true;
 }

 if (requiredRole === 'admin') return false;

 // 2. Resource specific ownership check
 switch (resourceType) {
 case 'transaction': {
 const transaction = await prisma.transaction.findUnique({ where: { id: resourceId } });
 if (!transaction) return false;
 
 if (requiredRole === 'owner') {
 return transaction.buyerId === userId;
 }
 if (requiredRole === 'participant') {
 return transaction.buyerId === userId || transaction.sellerId === userId;
 }
 return false;
 }

 case 'gig': {
 const gig = await prisma.gig.findUnique({ where: { id: resourceId } });
 if (!gig) return false;
 return gig.posted_by === userId;
 }

 case 'post': {
 const post = await prisma.post.findUnique({ where: { id: resourceId } });
 if (!post) return false;
 return post.authorId === userId;
 }

 case 'dispute': {
 const dispute = await prisma.dispute.findUnique({ 
 where: { id: resourceId },
 include: { transaction: true }
 });
 if (!dispute) return false;
 return dispute.transaction.buyerId === userId || dispute.transaction.sellerId === userId;
 }

 default:
 return false;
 }
 } catch (error) {
 console.error(`Authorization check failed for user ${userId} on ${resourceType} ${resourceId}:`, error);
 return false;
 }
}

/**
 * Middleware-like helper for use in route handlers.
 * Throws an error or returns unauthorized response if check fails.
 */
export async function authorize(
 resourceType: ResourceType,
 resourceId: string,
 requiredRole: RequiredRole = 'owner'
) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) {
 throw new Error("Unauthorized");
 }

 const isAuthorized = await verifyResourceOwnership(user.id, resourceType, resourceId, requiredRole);
 
 if (!isAuthorized) {
 // Log the unauthorized attempt for security monitoring
 console.warn(`SECURITY: Unauthorized access attempt by ${user.id} on ${resourceType} ${resourceId}`);
 throw new Error("Forbidden");
 }

 return user;
}
