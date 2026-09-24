import { describe, it, expect, vi } from "vitest";

import { prisma } from "@/lib/prisma";

import { GET } from "../app/api/internships/[id]/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    internship: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Internship Public Endpoint PII Masking", () => {
  it("never exposes poster.email while preserving public poster fields (name, id, username)", async () => {
    const validUuid = "11111111-1111-4111-8111-111111111111";

    vi.mocked(prisma.internship.findUnique).mockImplementation((async (args: any): Promise<any> => {
      // Simulate database returning exactly what was requested in select
      const selectObj = args.include?.poster?.select || {};
      const mockPoster: Record<string, any> = {};
      if (selectObj.id) mockPoster.id = "user-123";
      if (selectObj.name) mockPoster.name = "Acme Corp Recruiter";
      if (selectObj.image) mockPoster.image = "https://example.com/avatar.jpg";
      if (selectObj.username) mockPoster.username = "acme_recruiter";
      if (selectObj.email) mockPoster.email = "recruiter@acme.com";

      return {
        id: validUuid,
        title: "Software Engineering Intern",
        company: "Acme Corp",
        poster: mockPoster,
      };
    }) as any);

    const req = new Request(`http://localhost/api/internships/${validUuid}`, {
      method: "GET",
    });

    const res = await GET(req, { params: Promise.resolve({ id: validUuid }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.id).toBe(validUuid);
    expect(body.poster).toBeDefined();

    // Strict PII Assertions
    expect(body.poster.email).toBeUndefined();
    expect(body.poster.name).toBe("Acme Corp Recruiter");
    expect(body.poster.id).toBe("user-123");
    expect(body.poster.username).toBe("acme_recruiter");

    // Verify Prisma query select did NOT include email: true
    const calls = vi.mocked(prisma.internship.findUnique).mock.calls;
    const posterSelect = (calls[0][0] as any)?.include?.poster?.select;
    expect(posterSelect?.email).toBeUndefined();
    expect(posterSelect?.name).toBe(true);
    expect(posterSelect?.username).toBe(true);
  });
});
