import { NextResponse } from"next/server";

export const dynamic ="force-dynamic";

export async function GET() {
 try {
return NextResponse.json({ status:"live", timestamp: new Date().toISOString() });
 } catch (error) {
 console.error("API Error in src/app/api/live/route.ts:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
