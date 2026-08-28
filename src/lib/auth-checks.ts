import { NextResponse } from"next/server"

import { prisma } from"@/lib/prisma"
import { logSecurityEvent } from"@/lib/security/audit"
import { createClient } from"@/lib/supabase/server"

export const FOUNDER_EMAILS = [
"madhuvalurouthu52@gmail.com"
];

export function isPrivilegedEmail(email: string | null | undefined): boolean {
 if (!email) return false;
 return FOUNDER_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Server-side utility to get the current session user
 */
export async function getSession() {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()
 return user
}

/**
 * Fetches the user's role and suspension status directly from the database
 */
export async function getAuthProfileFromDb(userId: string) {
 if (!userId) return null;

 try {
 const dbUser = await prisma.user.findUnique({
 where: { id: userId },
 select: { role: true, isSuspended: true }
 });
 if (dbUser) return dbUser;

 // Auto-create profile in DB if user is authenticated but DB record is missing
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 
 if (user && user.id === userId) {
 const isFounder = isPrivilegedEmail(user.email);
 const isAcademicEmail = typeof user.email ==="string" && (
 user.email.endsWith(".edu") || 
 user.email.endsWith(".edu.in") || 
 user.email.endsWith(".res.in")
 );
 
 const finalRole = isFounder ?"FOUNDER" :"STUDENT";
 const autoVerify = isAcademicEmail || isFounder;

 console.log(`[getAuthProfileFromDb] Auto-creating missing user profile in database for ${user.email}`);
 try {
 const newProfile = await prisma.user.create({
 data: {
 id: user.id,
 email: user.email ||"",
 name: user.user_metadata?.name || null,
 full_name: user.user_metadata?.name || null,
 role: finalRole,
 isVerified: autoVerify,
 college: user.user_metadata?.college || null,
 acceptedTerms: true,
 acceptedTermsAt: new Date(),
 acceptedTermsVersion:"1.0",
 },
 select: { role: true, isSuspended: true }
 });
 return newProfile;
 } catch (createErr: any) {
 if (createErr.code ==="P2002") {
 console.log(`[getAuthProfileFromDb] Profile for ${user.email} was created concurrently. Fetching...`);
 const dbUserRetry = await prisma.user.findUnique({
 where: { id: userId },
 select: { role: true, isSuspended: true }
 });
 return dbUserRetry ?? { role: finalRole, isSuspended: false };
 }
 throw createErr;
 }
 }
 return null;
 } catch (error) {
 console.error("[getAuthProfileFromDb] Role fetch/auto-creation failed:", error);
 return null;
 }
}

/**
 * Fetches the user's role directly from the database
 * Retained for backward compatibility
 */
export async function getUserRoleFromDb(userId: string) {
 const profile = await getAuthProfileFromDb(userId);
 return profile?.role || null;
}

/**
 * Protects an API route by validating session and role from database
 */
export async function protectApi(allowedRoles: ("ADMIN" |"FOUNDER" |"STUDENT" |"STARTUP" |"CLIENT" |"COLLEGE")[]) {
 const user = await getSession();

 if (!user) {
 return { errorResponse: NextResponse.json({ error:"Unauthorized" }, { status: 401 }), user: null };
 }

 const profile = await getAuthProfileFromDb(user.id);
 
 if (profile?.isSuspended) {
 return { errorResponse: NextResponse.json({ error:"Account suspended" }, { status: 403 }), user, role: profile.role };
 }

 const normalizedRole = profile?.role ? profile.role.toUpperCase() : null;

 if (!normalizedRole || !allowedRoles.includes(normalizedRole as (typeof allowedRoles)[number])) {
 console.warn(`[AUTH] Unauthorized access attempt by ${user.email} (Role: ${normalizedRole}) to restricted API`);
 logSecurityEvent("AUTH_LOGIN_FAILED", {
 userId: user.id,
 metadata: {
 email: user.email,
 attemptedRole: normalizedRole ||"unknown",
 allowedRoles,
 context:"api"
 }
 }).catch(() => {});
 return { errorResponse: NextResponse.json({ error:"Forbidden" }, { status: 403 }), user, role: normalizedRole };
 }

 return { errorResponse: null, user, role: normalizedRole };
}

/**
 * Protects a Server Component/Action
 */
export async function protectPage(allowedRoles: ("ADMIN" |"FOUNDER" |"STUDENT" |"STARTUP" |"CLIENT" |"COLLEGE")[]) {
 const user = await getSession();

 if (!user) {
 return { authorized: false, user: null };
 }

 const profile = await getAuthProfileFromDb(user.id);

 if (profile?.isSuspended) {
 return { authorized: false, user, role: profile.role };
 }

 const normalizedRole = profile?.role ? profile.role.toUpperCase() : null;

 if (!normalizedRole || !allowedRoles.includes(normalizedRole as (typeof allowedRoles)[number])) {
 logSecurityEvent("AUTH_LOGIN_FAILED", {
 userId: user.id,
 metadata: {
 email: user.email,
 attemptedRole: normalizedRole ||"unknown",
 allowedRoles,
 context:"page"
 }
 }).catch(() => {});
 return { authorized: false, user, role: normalizedRole };
 }

 return { authorized: true, user, role: normalizedRole };
}

/**
 * Ensures user is authenticated, returning the Supabase User or an error Response
 */
export async function requireUser() {
 const user = await getSession();
 if (!user) {
 return { errorResponse: NextResponse.json({ error:"Unauthorized" }, { status: 401 }), user: null, role: null };
 }

 const profile = await getAuthProfileFromDb(user.id);
 if (profile?.isSuspended) {
 return { errorResponse: NextResponse.json({ error:"Account suspended" }, { status: 403 }), user, role: profile.role };
 }

 return { errorResponse: null, user, role: profile?.role || null };
}

/**
 * Ensures user has a specific role, returning the user and role or an error Response
 */
export async function requireRole(allowedRoles: ("ADMIN" |"FOUNDER" |"STUDENT" |"STARTUP" |"CLIENT" |"COLLEGE")[]) {
 const { errorResponse, user } = await requireUser();
 if (errorResponse) return { errorResponse, user: null, role: null };

 const profile = await getAuthProfileFromDb(user!.id);
 const normalizedRole = profile?.role ? profile.role.toUpperCase() : null;

 if (!normalizedRole || !allowedRoles.includes(normalizedRole as any)) {
 console.warn(`[AUTH] Unauthorized access attempt by ${user!.email} (Role: ${normalizedRole}) to restricted API`);
 logSecurityEvent("AUTH_LOGIN_FAILED", {
 userId: user!.id,
 metadata: {
 email: user!.email,
 attemptedRole: normalizedRole ||"unknown",
 allowedRoles,
 context:"api"
 }
 }).catch(() => {});
 return { errorResponse: NextResponse.json({ error:"Forbidden" }, { status: 403 }), user, role: null };
 }

 return { errorResponse: null, user, role: normalizedRole };
}

/**
 * Ensures user is a Founder
 */
export async function requireFounder() {
 return requireRole(["FOUNDER"]);
}

/**
 * Ensures user is an Administrator
 */
export async function requireAdmin() {
 return requireRole(["ADMIN"]);
}

/**
 * Ensures user is an Employer
 */
export async function requireEmployer() {
 return requireRole(["STARTUP","CLIENT","FOUNDER"]);
}

/**
 * Verifies user ownership of a resource
 */
export async function requireOwnership(userId: string, resourceOwnerId: string) {
 if (userId !== resourceOwnerId) {
 return { errorResponse: NextResponse.json({ error:"Forbidden: Ownership required" }, { status: 403 }) };
 }
 return { errorResponse: null };
}

/**
 * Verifies user belongs to an organization
 */
export async function requireOrganizationMember(userId: string, organizationId: string) {
 const membership = await (prisma as any).member.findFirst({
 where: { userId, organizationId },
 });
 if (!membership) {
 return { errorResponse: NextResponse.json({ error:"Forbidden: Member access required" }, { status: 403 }), membership: null };
 }
 return { errorResponse: null, membership };
}

/**
 * Verifies user is a participant of a conversation
 */
export async function requireConversationParticipant(userId: string, conversationId: string) {
 const conversation = await prisma.conversation.findFirst({
 where: {
 id: conversationId,
 OR: [
 { participant_1: userId },
 { participant_2: userId },
 ],
 },
 });
 if (!conversation) {
 return { errorResponse: NextResponse.json({ error:"Forbidden: Participant access required" }, { status: 403 }), conversation: null };
 }
 return { errorResponse: null, conversation };
}
