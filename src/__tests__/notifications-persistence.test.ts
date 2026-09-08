import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockUser: any = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: {
      getUser: vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: { user: mockUser },
          error: mockUser ? null : { message: "No session" },
        })
      ),
    },
  })),
}));

const mockNotifications = [
  { id: "notif-1", userId: "user-abc-123", title: "Gig Application", message: "Student applied", isRead: false },
  { id: "notif-2", userId: "user-abc-123", title: "Milestone Reached", message: "Deliverables submitted", isRead: false },
  { id: "notif-other", userId: "user-other-999", title: "Private Alert", message: "Other user alert", isRead: false },
];

const updateManyMock = vi.fn().mockImplementation(async ({ where, data }) => {
  let count = 0;
  mockNotifications.forEach((n) => {
    if (n.userId === where.userId) {
      if (where.id && n.id !== where.id) return;
      if (where.isRead !== undefined && n.isRead !== where.isRead) return;
      n.isRead = data.isRead;
      count++;
    }
  });
  return { count };
});

const findManyMock = vi.fn().mockImplementation(async ({ where }) => {
  return mockNotifications.filter((n) => n.userId === where.userId);
});

vi.mock("@/lib/prisma", () => ({
  default: {
    notification: {
      findMany: (...args: any[]) => findManyMock(...args),
      updateMany: (...args: any[]) => updateManyMock(...args),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (mockUser && mockUser.id === where.id) {
          return Promise.resolve({ id: mockUser.id, role: "STUDENT", isSuspended: false });
        }
        return Promise.resolve(null);
      }),
    },
  },
  prisma: {
    notification: {
      findMany: (...args: any[]) => findManyMock(...args),
      updateMany: (...args: any[]) => updateManyMock(...args),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (mockUser && mockUser.id === where.id) {
          return Promise.resolve({ id: mockUser.id, role: "STUDENT", isSuspended: false });
        }
        return Promise.resolve(null);
      }),
    },
  },
}));

import { GET, PATCH } from "@/app/api/notifications/route";

describe("Notifications API & Persistence (/api/notifications)", () => {
  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
    mockNotifications[0].isRead = false;
    mockNotifications[1].isRead = false;
    mockNotifications[2].isRead = false;
  });

  it("should reject unauthenticated GET requests with 401", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should reject unauthenticated PATCH requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "notif-1" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("should return user-scoped notifications for authenticated user", async () => {
    mockUser = { id: "user-abc-123", email: "student@campus.edu" };
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.notifications.length).toBe(2);
    expect(body.notifications.every((n: any) => n.userId === "user-abc-123")).toBe(true);
  });

  it("should mark single notification as read with strict user-scoping", async () => {
    mockUser = { id: "user-abc-123", email: "student@campus.edu" };
    const req = new NextRequest("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "notif-1" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "notif-1", userId: "user-abc-123" },
        data: { isRead: true },
      })
    );
    expect(mockNotifications[0].isRead).toBe(true);
    expect(mockNotifications[1].isRead).toBe(false);
  });

  it("should mark all user notifications as read with { id: 'all' }", async () => {
    mockUser = { id: "user-abc-123", email: "student@campus.edu" };
    const req = new NextRequest("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-abc-123", isRead: false },
        data: { isRead: true },
      })
    );
    expect(mockNotifications[0].isRead).toBe(true);
    expect(mockNotifications[1].isRead).toBe(true);
    // Other user's notification is untouched
    expect(mockNotifications[2].isRead).toBe(false);
  });

  it("should reject invalid request payload with 400", async () => {
    mockUser = { id: "user-abc-123", email: "student@campus.edu" };
    const req = new NextRequest("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wrongField: 123 }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid payload");
  });
});
