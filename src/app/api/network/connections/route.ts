import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

/**
 * GET /api/network/connections?status=ACCEPTED|PENDING
 * Returns connections for the current user
 */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "ACCEPTED";
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 20), 100);
  const skip = (page - 1) * pageSize;

  try {
    const [connections, total] = await Promise.all([
      prisma.connectionRequest.findMany({
        where: {
          OR: [
            { senderId: user.id, status },
            { receiverId: user.id, status },
          ],
        },
        include: {
          sender: {
            select: {
              id: true, name: true, email: true, image: true, bio: true,
              skills: true, role: true,
              userSkills: { include: { skill: true }, take: 6 },
            },
          },
          receiver: {
            select: {
              id: true, name: true, email: true, image: true, bio: true,
              skills: true, role: true,
              userSkills: { include: { skill: true }, take: 6 },
            },
          },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.connectionRequest.count({
        where: {
          OR: [
            { senderId: user.id, status },
            { receiverId: user.id, status },
          ],
        },
      }),
    ]);

    // Map to just get the "other" user for convenience
    const enriched = connections.map((conn: any) => {
      const otherUser = conn.senderId === user.id ? conn.receiver : conn.sender;
      return {
        connectionId: conn.id,
        status: conn.status,
        direction: conn.senderId === user.id ? "sent" : "received",
        message: conn.message,
        sentAt: conn.sentAt,
        respondedAt: conn.respondedAt,
        user: otherUser,
      };
    });

    return NextResponse.json({
      connections: enriched,
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: skip + connections.length < total,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error("[connections GET]", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

/**
 * POST /api/network/connections
 * Send a connection request
 * Body: { receiverId: string, message?: string }
 */
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { receiverId, message } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
    }
    if (receiverId === user.id) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    // Check if a connection already exists in either direction
    const existing = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "BLOCKED") {
        return NextResponse.json({ error: "Cannot connect with this user" }, { status: 403 });
      }
      if (existing.status === "REJECTED") {
        // Check 30-day cooldown
        const daysSinceRejection = existing.respondedAt
          ? (Date.now() - new Date(existing.respondedAt).getTime()) / (1000 * 60 * 60 * 24)
          : 0;
        if (daysSinceRejection < 30) {
          return NextResponse.json(
            { error: "You can resend a request after 30 days" },
            { status: 429 }
          );
        }
        // Allow re-request after 30 days: delete old and create new
        await prisma.connectionRequest.delete({ where: { id: existing.id } });
      } else {
        return NextResponse.json(
          { error: "Connection request already exists", status: existing.status },
          { status: 409 }
        );
      }
    }

    const connection = await prisma.connectionRequest.create({
      data: {
        senderId: user.id,
        receiverId,
        message: message?.slice(0, 200),
        status: "PENDING",
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "CONNECTION_REQUEST",
        title: "New connection request",
        message: `Someone wants to connect with you${message ? `: "${message.slice(0, 100)}"` : ""}`,
        link: "/network?tab=pending",
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ error: "Connection request already exists" }, { status: 409 });
    }
    console.error("[connections POST]", error);
    return NextResponse.json({ error: "Failed to send connection request" }, { status: 500 });
  }
}

/**
 * PATCH /api/network/connections
 * Accept, reject, cancel, or block a connection
 * Body: { connectionId: string, action: 'accept' | 'reject' | 'cancel' | 'block' }
 */
export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { connectionId, action } = await req.json();

    if (!connectionId || !action) {
      return NextResponse.json({ error: "connectionId and action are required" }, { status: 400 });
    }

    const connection = await prisma.connectionRequest.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Authorize: accept/reject = receiver only; cancel = sender only; block = either
    if (action === "accept" || action === "reject") {
      if (connection.receiverId !== user.id) {
        return NextResponse.json({ error: "Only the receiver can accept/reject" }, { status: 403 });
      }
    } else if (action === "cancel") {
      if (connection.senderId !== user.id) {
        return NextResponse.json({ error: "Only the sender can cancel" }, { status: 403 });
      }
    } else if (action !== "block") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      accept: "ACCEPTED",
      reject: "REJECTED",
      cancel: "CANCELLED",
      block: "BLOCKED",
    };

    if (action === "cancel") {
      // Delete instead of update for cancellation
      await prisma.connectionRequest.delete({ where: { id: connectionId } });
      return NextResponse.json({ success: true, action: "cancelled" });
    }

    const updated = await prisma.connectionRequest.update({
      where: { id: connectionId },
      data: {
        status: statusMap[action],
        respondedAt: new Date(),
      },
    });

    // Notify the other party
    if (action === "accept") {
      // Notify sender that their request was accepted
      await prisma.notification.create({
        data: {
          userId: connection.senderId,
          type: "CONNECTION_ACCEPTED",
          title: "Connection accepted!",
          message: "Your connection request was accepted. You can now message them.",
          link: "/network?tab=connections",
        },
      });
    }

    return NextResponse.json({ connection: updated });
  } catch (error) {
    console.error("[connections PATCH]", error);
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}
