import { getOpenAI } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentType = 'gig' | 'post' | 'bio' | 'message' | 'cover_letter' | 'comment' | 'review';

export interface ModerationInput {
  content: string;
  contentType: ContentType;
  authorId?: string;
  contentId?: string;
}

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  autoReject: boolean;
  score: number; // 0–1 (1 = most problematic)
  categories: {
    openai: Record<string, boolean>;
    custom: string[];
  };
  reason?: string;
  action: 'APPROVE' | 'FLAG' | 'REJECT';
}

// ─── Custom Rule Patterns ─────────────────────────────────────────────────────

const HARD_BLOCK_PATTERNS = [
  /\b(whatsapp|telegram|instagram|snapchat)\s*(number|id|handle|@)\b/i,
  /(?:\+91|0)[6-9]\d{9}/,                          // Indian mobile numbers
  /\b\d{10,12}\b/,                                   // any long digit string
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email addresses
  /pay\s*outside|off\s*platform|direct\s*payment|bypass/i,
  /upwork|freelancer\.com|fiverr|toptal/i,
  /\b(scam|fraud|fake|cheat|hack|exploit)\b/i,
  /(sex|porn|xxx|nude|escort|prostitut)/i,
];

const SOFT_FLAG_PATTERNS = [
  /contact\s*(me|us)\s*(at|on|via)/i,
  /\b(guaranteed|instant|100%)\s*(profit|return|earn)/i,
  /\b(no\s*experience|no\s*skill)\s*(needed|required)/i,
  /\b(click\s*here|visit\s*this|check\s*link)\b/i,
  /dm\s*me|slide\s*(in\s*)?dms/i,
];

// ─── Core Moderation Function ─────────────────────────────────────────────────

export async function moderateContent(input: ModerationInput): Promise<ModerationResult> {
  const { content, contentType } = input;
  const text = content.trim();

  // 1. Custom hard-block rules (synchronous, instant)
  const hardBlockHit = HARD_BLOCK_PATTERNS.find(p => p.test(text));
  if (hardBlockHit) {
    return {
      safe: false,
      flagged: true,
      autoReject: true,
      score: 1.0,
      categories: { openai: {}, custom: ['hard_block_pattern'] },
      reason: 'Content contains contact info, external platform references, or prohibited material.',
      action: 'REJECT',
    };
  }

  // 2. Soft flag check (accumulate count)
  const softHits = SOFT_FLAG_PATTERNS.filter(p => p.test(text)).length;

  let openaiCategories: Record<string, boolean> = {};
  let openaiScore = 0;
  let openaiFlagged = false;

  const apiKey = process.env.OPENAI_API_KEY || "";
  const isPlaceholder = apiKey === "" || apiKey.includes("placeholder") || apiKey.includes("your_openai");
  const isGroq = apiKey.startsWith("gsk_");

  if (!isPlaceholder && !isGroq) {
    try {
      const openai = getOpenAI();
      const response = await openai.moderations.create({
        model: process.env.AI_MODERATION_MODEL || 'omni-moderation-latest',
        input: text,
      });

      const result = response.results[0];
      openaiFlagged = result.flagged;
      openaiCategories = result.categories as unknown as Record<string, boolean>;

      // Get max category score
      const scores = result.category_scores as unknown as Record<string, number>;
      openaiScore = Math.max(...Object.values(scores));
    } catch (err) {
      console.error('[moderator] OpenAI moderation API error:', err);
      // Fall back to custom rules only — don't block legitimate content
    }
  }

  // 4. Combine scores
  const customScore = Math.min(softHits * 0.15, 0.6);
  const combinedScore = Math.min(Math.max(openaiScore, customScore), 1.0);

  // 5. Determine action thresholds
  // Content-type-specific strictness
  const strictTypes: ContentType[] = ['gig', 'post', 'bio'];
  const isStrict = strictTypes.includes(contentType);

  const rejectThreshold = isStrict ? 0.7 : 0.85;
  const flagThreshold = isStrict ? 0.4 : 0.55;

  let action: 'APPROVE' | 'FLAG' | 'REJECT';
  if (openaiFlagged || combinedScore >= rejectThreshold) {
    action = 'REJECT';
  } else if (combinedScore >= flagThreshold || softHits >= 2) {
    action = 'FLAG';
  } else {
    action = 'APPROVE';
  }

  return {
    safe: action === 'APPROVE',
    flagged: action !== 'APPROVE',
    autoReject: action === 'REJECT',
    score: combinedScore,
    categories: {
      openai: openaiCategories,
      custom: softHits > 0 ? ['soft_flag_pattern'] : [],
    },
    reason: action !== 'APPROVE'
      ? `Content score: ${(combinedScore * 100).toFixed(0)}%. ${openaiFlagged ? 'Flagged by OpenAI.' : ''} ${softHits > 0 ? `${softHits} soft flag(s) detected.` : ''}`.trim()
      : undefined,
    action,
  };
}

// ─── Batch moderation (for use during gig creation) ──────────────────────────

export async function moderateGig(title: string, description: string, authorId: string): Promise<ModerationResult> {
  const combined = `Title: ${title}\n\nDescription: ${description}`;
  return moderateContent({
    content: combined,
    contentType: 'gig',
    authorId,
  });
}

export async function moderatePost(content: string, authorId: string): Promise<ModerationResult> {
  return moderateContent({
    content,
    contentType: 'post',
    authorId,
  });
}

export async function moderateBio(bio: string, authorId: string): Promise<ModerationResult> {
  return moderateContent({
    content: bio,
    contentType: 'bio',
    authorId,
  });
}
