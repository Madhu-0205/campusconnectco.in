import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

/**
 * GET /api/network/status?userId=<uuid>
 * Returns the connection status between the current user and the target user.
 * Response: { status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked', connectionId?: string }
 */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("userId");

  if (!targetId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (targetId === user.id) {
    return NextResponse.json({ status: "self" });
  }

  try {
    const connection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetId },
          { senderId: targetId, receiverId: user.id },
        ],
      },
      select: {
        id: true,
        senderId: true,
        status: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ status: "none" });
    }

    // Map DB status + direction to UI status
    const dbStatus = connection.status;
    let uiStatus: string;

    if (dbStatus === "ACCEPTED") {
      uiStatus = "accepted";
    } else if (dbStatus === "BLOCKED") {
      uiStatus = "blocked";
    } else if (dbStatus === "REJECTED" || dbStatus === "CANCELLED") {
      uiStatus = "none";
    } else if (dbStatus === "PENDING") {
      uiStatus = connection.senderId === user.id ? "pending_sent" : "pending_received";
    } else {
      uiStatus = "none";
    }

    return NextResponse.json({
      status: uiStatus,
      connectionId: connection.id,
    });
  } catch (error) {
    console.error("[connection status]", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
