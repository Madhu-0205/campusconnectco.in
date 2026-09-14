import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth-checks', () => ({
  protectApi: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/puter', () => ({
  puterAI: {
    chat: vi.fn(),
  },
}));

import { POST } from '@/app/api/ai/skill-gap/route';
import { protectApi } from '@/lib/auth-checks';
import prisma from '@/lib/prisma';
import { puterAI } from '@/lib/ai/puter';

describe('POST /api/ai/skill-gap — Puter-Only Integration & Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthenticated requests with HTTP 401', async () => {
    vi.mocked(protectApi).mockResolvedValue({
      user: null,
      errorResponse: null,
    } as any);

    const req = new NextRequest('http://localhost:3000/api/ai/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ targetRole: 'Frontend Developer' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should reject requests without targetRole with HTTP 400', async () => {
    vi.mocked(protectApi).mockResolvedValue({
      user: { id: 'usr-student-1', role: 'STUDENT' },
      errorResponse: null,
    } as any);

    const req = new NextRequest('http://localhost:3000/api/ai/skill-gap', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('targetRole is required');
  });

  it('should successfully parse Puter AI chat response and return structured skill gap', async () => {
    vi.mocked(protectApi).mockResolvedValue({
      user: { id: 'usr-student-1', role: 'STUDENT' },
      errorResponse: null,
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'usr-student-1',
      userSkills: [
        { skill: { name: 'React' } },
        { skill: { name: 'JavaScript' } },
      ],
    } as any);

    vi.mocked(puterAI.chat).mockResolvedValue(JSON.stringify({
      matchedSkills: ['React', 'JavaScript'],
      missingSkills: ['TypeScript', 'Next.js', 'Tailwind CSS'],
      learningPlan: [
        'Learn TypeScript fundamentals',
        'Build a Next.js App Router project',
        'Style components with Tailwind CSS',
      ],
    }));

    const req = new NextRequest('http://localhost:3000/api/ai/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ targetRole: 'Frontend Developer' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.poweredBy).toBe('Puter.js');
    expect(data.data.matchedSkills).toEqual(['React', 'JavaScript']);
    expect(data.data.missingSkills).toEqual(['TypeScript', 'Next.js', 'Tailwind CSS']);
    expect(data.data.learningPlan).toHaveLength(3);
  });

  it('should employ deterministic fallback when Puter AI times out or throws without returning 500', async () => {
    vi.mocked(protectApi).mockResolvedValue({
      user: { id: 'usr-student-1', role: 'STUDENT' },
      errorResponse: null,
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'usr-student-1',
      userSkills: [
        { skill: { name: 'Python' } },
      ],
    } as any);

    // Simulate Puter timeout or network offline exception
    vi.mocked(puterAI.chat).mockRejectedValue(new Error('Puter AI request timed out after 12000ms'));

    const req = new NextRequest('http://localhost:3000/api/ai/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ targetRole: 'Backend Developer' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200); // Must NOT return 500
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.poweredBy).toBe('Puter.js');
    expect(data.isFallback).toBe(true);
    expect(Array.isArray(data.data.matchedSkills)).toBe(true);
    expect(Array.isArray(data.data.missingSkills)).toBe(true);
    expect(Array.isArray(data.data.learningPlan)).toBe(true);
    expect(data.data.learningPlan.length).toBeGreaterThan(0);
  });
});
