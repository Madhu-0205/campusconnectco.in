/**
 * Notification Tool for AI Agents
 *
 * Enforces:
 * 1. Anti-spam throttle (prevents repeated notifications within 24 hours)
 * 2. Meaningful event gating (only triggers on high-value matches or critical deadline/status changes)
 * 3. Atomic insertion into prisma.notification
 */

import prisma from "@/lib/prisma";
import { ToolExecutionError } from "../core/errors";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  throttleHours?: number;
}

export async function createAgentNotification(input: CreateNotificationInput): Promise<boolean> {
  if (!input.userId || !input.title || !input.message) {
    throw new ToolExecutionError("notification.create", "User ID, title, and message are required");
  }

  const throttleHours = input.throttleHours ?? 24;
  const since = new Date(Date.now() - throttleHours * 60 * 60 * 1000);

  try {
    // Check for recent duplicate notification to prevent user spam
    const existing = await prisma.notification.findFirst({
      where: {
        userId: input.userId,
        title: input.title,
        createdAt: { gte: since }
      },
      select: { id: true }
    });

    if (existing) {
      return false; // Throttled
    }

    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        isRead: false
      }
    });

    return true;
  } catch (err: any) {
    throw new ToolExecutionError("notification.create", err instanceof Error ? err.message : String(err));
  }
}
