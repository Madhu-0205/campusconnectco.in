import { describe, it, expect } from "vitest";

import { computeLevel, getStreakMultiplier, computeSmartScore } from "../lib/gamification";

describe("Gamification Calculations", () => {
  describe("computeLevel", () => {
    it("should classify 0 XP as Level 1 Newcomer", () => {
      const res = computeLevel(0);
      expect(res.level).toBe(1);
      expect(res.title).toBe("Newcomer");
      expect(res.progress).toBe(0);
    });

    it("should calculate correct progress percentage between thresholds", () => {
      // Level 1 minXp = 0, Level 2 minXp = 200. Total XP = 100 is exactly 50%
      const res = computeLevel(100);
      expect(res.level).toBe(1);
      expect(res.progress).toBe(50);
    });

    it("should classify exactly at threshold values correctly", () => {
      // Level 2 threshold = 200
      const res = computeLevel(200);
      expect(res.level).toBe(2);
      expect(res.title).toBe("Explorer");
      expect(res.progress).toBe(0);
    });

    it("should classify at high XP values up to the maximum level", () => {
      // Legend is Level 11, Campus Icon is Level 12 (45000 XP)
      const res = computeLevel(50000);
      expect(res.level).toBe(12);
      expect(res.title).toBe("Campus Icon");
      expect(res.progress).toBe(100);
    });
  });

  describe("getStreakMultiplier", () => {
    it("should return 1.0 multiplier for low streaks", () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it("should return correct multipliers on boundaries", () => {
      expect(getStreakMultiplier(3)).toBe(1.1);
      expect(getStreakMultiplier(7)).toBe(1.2);
      expect(getStreakMultiplier(14)).toBe(1.35);
      expect(getStreakMultiplier(30)).toBe(1.5);
      expect(getStreakMultiplier(60)).toBe(1.75);
      expect(getStreakMultiplier(100)).toBe(2.0);
    });

    it("should return highest matching multiplier for higher streaks", () => {
      expect(getStreakMultiplier(150)).toBe(2.0); // 100+ threshold
    });
  });

  describe("computeSmartScore", () => {
    it("should compute composite score correctly", () => {
      // Formula: r * 0.35 + e * 0.35 + l * 0.2 + c * 0.1
      // r=80, e=70, l=90, c=60
      // 80*0.35 = 28
      // 70*0.35 = 24.5
      // 90*0.20 = 18
      // 60*0.10 = 6
      // Sum = 76.5 -> round to 77
      const score = computeSmartScore(80, 70, 90, 60);
      expect(score).toBe(77);
    });

    it("should cap composite score at 100", () => {
      const score = computeSmartScore(120, 100, 100, 100);
      expect(score).toBe(100);
    });

    it("should calculate correct score on zeros", () => {
      expect(computeSmartScore(0, 0, 0, 0)).toBe(0);
    });
  });
});
