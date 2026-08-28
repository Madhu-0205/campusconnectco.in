import { Prisma } from"@prisma/client";
import { NextRequest, NextResponse } from"next/server";

import prisma from"@/lib/prisma";

export async function GET(request: NextRequest) {
 try {
 const searchParams = request.nextUrl.searchParams;

 // Pagination
 const page = parseInt(searchParams.get("page") ||"1");
 const limit = parseInt(searchParams.get("limit") ||"12");
 const skip = (page - 1) * limit;

 // Search query
 const query = searchParams.get("q") ||"";

 // Filters
 const categories = searchParams.get("category")?.split(",").filter(Boolean) || [];
 const budgetMin = parseFloat(searchParams.get("budgetMin") ||"0");
 const budgetMax = parseFloat(searchParams.get("budgetMax") ||"1000000");
 const location = searchParams.get("location") ||"";
 const collegeId = searchParams.get("collegeId") ||"";
 const city = searchParams.get("city") ||"";
 const state = searchParams.get("state") ||"";
 const status = searchParams.get("status") ||"";
 const sortBy = searchParams.get("sortBy") ||"newest";

 // Build where clause
 const where: Prisma.GigWhereInput = {};

 // Search in title, description, and tags
 if (query) {
 where.OR = [
 { title: { contains: query, mode:"insensitive" } },
 { description: { contains: query, mode:"insensitive" } },
 { tags: { contains: query, mode:"insensitive" } },
 ];
 }

 // Category filter (tags)
 if (categories.length > 0) {
 where.AND = categories.map((category) => ({
 tags: { contains: category, mode:"insensitive" },
 }));
 }

 // Budget range
 if (budgetMin > 0 || budgetMax < 1000000) {
 where.budget = {
 gte: budgetMin,
 lte: budgetMax,
 };
 }

 // Status filter
 if (status) {
 where.status = status;
 }

 // Location filter (if provided)
 if (location) {
 where.OR = [
 ...(where.OR || []),
 { city: { contains: location, mode:"insensitive" } },
 { state: { contains: location, mode:"insensitive" } },
 ];
 }

 if (city) {
 where.city = { contains: city, mode:"insensitive" };
 }
 
 if (state) {
 where.state = { contains: state, mode:"insensitive" };
 }
 
 if (collegeId) {
 where.collegeId = collegeId;
 }

 // Build orderBy clause
 let orderBy: Prisma.GigOrderByWithRelationInput = {};
 switch (sortBy) {
 case"newest":
 orderBy = { createdAt:"desc" };
 break;
 case"oldest":
 orderBy = { createdAt:"asc" };
 break;
 case"budget-high":
 orderBy = { budget:"desc" };
 break;
 case"budget-low":
 orderBy = { budget:"asc" };
 break;
 case"deadline":
 orderBy = { deadline:"asc" };
 break;
 case"popular":
 // This would require a subquery or aggregation
 // For now, default to newest
 orderBy = { createdAt:"desc" };
 break;
 default:
 orderBy = { createdAt:"desc" };
 }

 // Fetch gigs with pagination
 const [gigs, total] = await Promise.all([
 prisma.gig.findMany({
 where,
 orderBy,
 skip,
 take: limit,
 include: {
 poster: {
 select: {
 name: true,
 image: true,
 },
 },
 _count: {
 select: {
 applications: true,
 },
 },
 },
 }),
 prisma.gig.count({ where }),
 ]);

 const hasMore = skip + gigs.length < total;

 return NextResponse.json({
 gigs,
 total,
 page,
 limit,
 hasMore,
 totalPages: Math.ceil(total / limit),
 });
 } catch (error) {
 console.error("Error fetching gigs:", error);
 return NextResponse.json(
 { error:"Failed to fetch gigs" },
 { status: 500 }
 );
 }
}
