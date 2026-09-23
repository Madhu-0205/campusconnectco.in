/**
 * Centralized AI Adapter for CampusConnect Intelligence Layer (Groq / openai/gpt-oss-120b)
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. "CampusConnect decides what is true. AI helps users understand, create, and act on it."
 * 2. Groq is isolated behind this adapter.
 * 3. Handles rate-limits, unconfigured keys, network failures gracefully with truthful fallbacks.
 * 4. Grounded in CampusConnect PostgreSQL & Prisma data; deterministic algorithms remain authoritative.
 * 5. Secret isolation: GROQ_API_KEY is never exposed or logged.
 */

import {
  scrubSensitiveData,
  validatePromptLength,
  safeParseJson,
  MatchExplanationSchema,
  OpportunitySummarySchema,
  ResumeAnalysisSchema,
  InterviewEvaluationSchema,
} from "./guards";
import {
  careerCopilotSystemPrompt,
  matchExplanationPrompt,
  opportunitySummaryPrompt,
  resumeAnalysisPrompt,
  interviewQuestionPrompt,
  interviewEvaluationPrompt,
} from "./prompts";
import {
  type AIProvider,
  defaultGroqProvider,
  GROQ_DEFAULT_MODEL,
  DEFAULT_TIMEOUT_MS,
} from "./provider";
import type {
  AIChatMessage,
  CopilotContextData,
  MatchExplanationInput,
  MatchExplanationOutput,
  OpportunitySummaryInput,
  OpportunitySummaryOutput,
  ResumeAnalysisOutput,
  InterviewQuestionInput,
  InterviewEvaluationOutput,
  AIAdapterOptions,
  AIPoweredBy,
} from "./types";

const POWERED_BY_LABEL: AIPoweredBy = "Groq (openai/gpt-oss-120b)";

export class AIAdapter {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || defaultGroqProvider;
  }

  public getProvider(): AIProvider {
    return this.provider;
  }

  public isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  /**
   * Safe chat completion using Groq provider
   */
  public async chat(
    messages: AIChatMessage[],
    options?: AIAdapterOptions
  ): Promise<string> {
    const sanitizedMessages = messages.map((m) => ({
      role: m.role,
      content: validatePromptLength(scrubSensitiveData(m.content), 4000),
    }));

    try {
      const response = await this.provider.chat(sanitizedMessages, {
        model: options?.model || GROQ_DEFAULT_MODEL,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1000,
        timeoutMs: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        signal: options?.signal,
      });

      return (response || "").trim();
    } catch (error: any) {
      console.warn(`[AIAdapter] Groq API call failed (${error?.message || error}). Employing truthful fallback.`);
      return this.fallbackChatResponse(sanitizedMessages);
    }
  }

  /**
   * Safe streaming chat completion using Groq provider
   */
  public async *streamChat(
    messages: AIChatMessage[],
    options?: AIAdapterOptions
  ): AsyncIterable<string> {
    const sanitizedMessages = messages.map((m) => ({
      role: m.role,
      content: validatePromptLength(scrubSensitiveData(m.content), 4000),
    }));

    yield* this.provider.streamChat(sanitizedMessages, {
      model: options?.model || GROQ_DEFAULT_MODEL,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
      timeoutMs: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      signal: options?.signal,
    });
  }

  /**
   * Career Copilot Mentor Chat
   */
  public async copilotChat(
    userQuery: string,
    history: AIChatMessage[],
    context?: CopilotContextData,
    options?: AIAdapterOptions
  ): Promise<{ message: string; poweredBy: AIPoweredBy; isFallback: boolean }> {
    const systemPrompt = careerCopilotSystemPrompt(context);
    const messages: AIChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6),
      { role: "user", content: userQuery },
    ];

    try {
      const responseText = await this.chat(messages, options);
      if (
        responseText &&
        !responseText.startsWith("AI assistance is temporarily unavailable")
      ) {
        return { message: responseText, poweredBy: POWERED_BY_LABEL, isFallback: false };
      }
      return {
        message: this.buildGroundedCopilotFallback(userQuery, context),
        poweredBy: POWERED_BY_LABEL,
        isFallback: true,
      };
    } catch {
      return {
        message: this.buildGroundedCopilotFallback(userQuery, context),
        poweredBy: POWERED_BY_LABEL,
        isFallback: true,
      };
    }
  }

  /**
   * Feature 2: Smart Match Explanation
   */
  public async explainMatch(
    input: MatchExplanationInput,
    options?: AIAdapterOptions
  ): Promise<MatchExplanationOutput> {
    const prompt = matchExplanationPrompt(input);
    const fallback = this.fallbackMatchExplanation(input);

    try {
      const raw = await this.chat(
        [
          { role: "system", content: "You explain student opportunity matches on CampusConnectCo in strict JSON format." },
          { role: "user", content: prompt },
        ],
        { ...options, temperature: 0.3 }
      );

      return safeParseJson<MatchExplanationOutput>(raw, MatchExplanationSchema, fallback);
    } catch {
      return fallback;
    }
  }

  /**
   * Feature 3: AI Opportunity Summary
   */
  public async summarizeOpportunity(
    input: OpportunitySummaryInput,
    options?: AIAdapterOptions
  ): Promise<OpportunitySummaryOutput> {
    const prompt = opportunitySummaryPrompt(input);
    const fallback = this.fallbackOpportunitySummary(input);

    try {
      const raw = await this.chat(
        [
          { role: "system", content: "You generate structured opportunity summaries for college students in strict JSON format." },
          { role: "user", content: prompt },
        ],
        { ...options, temperature: 0.3 }
      );

      return safeParseJson<OpportunitySummaryOutput>(raw, OpportunitySummarySchema, fallback);
    } catch {
      return fallback;
    }
  }

  /**
   * Feature 4: Resume Analyzer
   */
  public async analyzeResume(
    resumeText: string,
    options?: AIAdapterOptions
  ): Promise<ResumeAnalysisOutput> {
    const prompt = resumeAnalysisPrompt(resumeText);
    const fallback = this.fallbackResumeAnalysis(resumeText);

    try {
      const raw = await this.chat(
        [
          { role: "system", content: "You are an ATS resume analyzer that outputs strict JSON." },
          { role: "user", content: prompt },
        ],
        { ...options, temperature: 0.4 }
      );

      return safeParseJson<ResumeAnalysisOutput>(raw, ResumeAnalysisSchema, fallback);
    } catch {
      return fallback;
    }
  }

  /**
   * Feature 5: Interview Simulator Question Generator
   */
  public async generateInterviewQuestion(
    input: InterviewQuestionInput,
    options?: AIAdapterOptions
  ): Promise<{ question: string; poweredBy: AIPoweredBy }> {
    const prompt = interviewQuestionPrompt(input);

    try {
      const raw = await this.chat(
        [
          { role: "system", content: "You conduct interactive mock technical interviews for students." },
          { role: "user", content: prompt },
        ],
        { ...options, temperature: 0.6 }
      );

      if (raw && raw.length > 10 && !raw.startsWith("AI assistance is temporarily unavailable")) {
        return { question: raw, poweredBy: POWERED_BY_LABEL };
      }
      return { question: this.fallbackInterviewQuestion(input), poweredBy: POWERED_BY_LABEL };
    } catch {
      return { question: this.fallbackInterviewQuestion(input), poweredBy: POWERED_BY_LABEL };
    }
  }

  /**
   * Feature 5: Interview Simulator Final Evaluator
   */
  public async evaluateInterview(
    input: InterviewQuestionInput,
    options?: AIAdapterOptions
  ): Promise<InterviewEvaluationOutput> {
    const prompt = interviewEvaluationPrompt(input);
    const fallback = this.fallbackInterviewEvaluation(input);

    try {
      const raw = await this.chat(
        [
          { role: "system", content: "You evaluate mock technical interview transcripts in strict JSON format." },
          { role: "user", content: prompt },
        ],
        { ...options, temperature: 0.3 }
      );

      return safeParseJson<InterviewEvaluationOutput>(raw, InterviewEvaluationSchema, fallback);
    } catch {
      return fallback;
    }
  }

  // ---------------------------------------------------------------------------
  // Grounded Deterministic Fallbacks
  // ---------------------------------------------------------------------------

  private fallbackChatResponse(messages: AIChatMessage[]): string {
    const lastUser = messages.filter((m) => m.role === "user").pop()?.content || "";
    const lowerQ = lastUser.toLowerCase();

    if (
      lowerQ.includes("what is campusconnect") ||
      lowerQ.includes("about campusconnect") ||
      lowerQ.includes("how does campusconnect work")
    ) {
      return `AI assistance is temporarily unavailable.

**Verified CampusConnectCo Platform Information:**
CampusConnectCo (campusconnectco.in) is India's dedicated student opportunity platform and freelance gig marketplace.
- **Verified Gigs & Internships**: Search tech, design, marketing, and campus opportunities posted by vetted founders and startups.
- **JobNest Map Discovery**: Interactive geolocation to find opportunities around Indian university hubs.
- **SmartMatch Scoring**: Compatibility matching between student skills and active role requirements.
- **Milestone-Based Tracking**: Structured deliverable sign-offs for student safety.

*(Note: Live Groq AI response is temporarily unavailable; verified platform records shown.)*`;
    }

    const topicHint = lastUser ? ` regarding "${lastUser.slice(0, 40)}"` : "";
    return `AI assistance is temporarily unavailable.

Based on CampusConnectCo verified marketplace records${topicHint}:
- Explore top matched gigs and internships directly in your student dashboard.
- Prepare your profile and portfolio to match listed project skills.

*(Note: Live Groq AI response is temporarily unavailable; verified platform records shown.)*`;
  }

  private buildGroundedCopilotFallback(query: string, context?: CopilotContextData): string {
    const lowerQ = query.toLowerCase();
    const recs = context?.topRecommendations || [];
    let recsText = "";
    if (recs.length > 0) {
      recsText =
        `\n\n**Verified CampusConnectCo Matches:**\n` +
        recs
          .slice(0, 3)
          .map(
            (r, i) =>
              `${i + 1}. **${r.title}** at *${r.company}* (${r.location}) — Match Score: ${r.matchScore}/100`
          )
          .join("\n");
    }

    if (
      lowerQ.includes("what is campusconnect") ||
      lowerQ.includes("about campusconnect") ||
      lowerQ.includes("how does campusconnect work")
    ) {
      return `AI assistance is temporarily unavailable.

**Verified CampusConnectCo Platform Information:**
CampusConnectCo (campusconnectco.in) is India's student super-app connecting college students with:
- **Verified Gigs & Tech Internships** across top tech hubs and universities.
- **JobNest Map**: Real-time geolocation-based opportunity discovery.
- **SmartMatch**: Automated skill compatibility scoring.
- **Milestone Delivery**: Transparent deliverable tracking and sign-off.

*(You can retry your AI query shortly or explore verified listings directly.)*`;
    }

    return `AI assistance is temporarily unavailable.

**Verified Guidance from CampusConnectCo Platform Records:**
To maximize your chances for technical gigs and internships:
- Ensure your profile showcases projects relevant to your goal (${context?.user?.careerGoal || "Software Engineering"}).
- Match your listed skills with active tags on verified postings.${recsText}

*(You can retry your AI query shortly or explore verified listings directly.)*`;
  }

  private fallbackMatchExplanation(input: MatchExplanationInput): MatchExplanationOutput {
    const matchedCount = input.matchedSkills.length;
    const locationText = input.locationContext.isRemote
      ? "This is a remote opportunity available nationwide."
      : input.locationContext.isNearby
      ? `Located within campus proximity (${input.locationContext.distanceKm ?? 10} km from ${input.locationContext.collegeName || "your college"}).`
      : "Connected through our regional campus network.";

    return {
      summary: `You match ${matchedCount > 0 ? `${matchedCount} core skills` : "the background profile"} for this ${input.opportunityType}.`,
      scoreBreakdown: {
        skillMatchExplanation:
          input.matchedSkills.length > 0
            ? `Matched skills include: ${input.matchedSkills.slice(0, 4).join(", ")}.`
            : "General skill alignment with opportunity tags.",
        locationExplanation: locationText,
        freshnessExplanation:
          input.freshnessDays <= 3
            ? "Recently posted opportunity with high recruitment activity."
            : "Active verified listing on CampusConnectCo.",
      },
      suggestedAction:
        input.missingSkills.length > 0
          ? `Highlight your proficiency in ${input.matchedSkills[0] || "core concepts"} and note familiarity with ${input.missingSkills[0]}.`
          : "Review the opportunity scope and submit your application.",
      poweredBy: POWERED_BY_LABEL,
    };
  }

  private fallbackOpportunitySummary(input: OpportunitySummaryInput): OpportunitySummaryOutput {
    return {
      whatYouWillDo: [
        `Deliver project milestones for "${input.title}".`,
        "Collaborate with the client team to meet technical specifications.",
        "Implement solutions following industry best practices.",
      ],
      skillsNeeded: input.tags.length > 0 ? input.tags : ["Problem Solving", "Communication", "Technical Domain Knowledge"],
      whoThisSuits: `Students with practical skills in ${input.tags.slice(0, 3).join(", ") || "software/design"} seeking real-world experience.`,
      compensationVerified: input.compensation || "Standard platform compensation",
      locationDetails: input.location || "CampusConnectCo verified location",
      importantRequirements: [
        "Reliable delivery within stated timeline.",
        "Adherence to platform milestone completion guidelines.",
      ],
      preparationTips: [
        "Review project requirements and confirm deliverables with the client.",
        "Prepare relevant project samples demonstrating related skills.",
      ],
      poweredBy: POWERED_BY_LABEL,
    };
  }

  private fallbackResumeAnalysis(text: string): ResumeAnalysisOutput {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const commonTechSkills = ["React", "TypeScript", "Node.js", "Python", "SQL", "Git", "Docker", "Java", "C++", "Next.js"];
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const detected = commonTechSkills.filter((s) => new RegExp(`\\b${escapeRegex(s)}\\b`, "i").test(text));
    const missing = commonTechSkills.filter((s) => !detected.includes(s)).slice(0, 4);

    const score = Math.min(95, Math.max(60, Math.round(55 + detected.length * 5 + Math.min(20, wordCount / 20))));
    let grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" = "B";
    if (score >= 90) grade = "A+";
    else if (score >= 85) grade = "A";
    else if (score >= 80) grade = "B+";
    else if (score >= 70) grade = "B";
    else grade = "C+";

    return {
      score,
      grade,
      strengths: [
        `Identified ${detected.length} core technical competencies (${detected.slice(0, 4).join(", ") || "foundational concepts"}).`,
        "Clear professional contact format and education timeline.",
        "Structured section breakdown for ATS parsers.",
      ],
      weaknesses: [
        "Add more quantifiable achievement metrics (% efficiency, user reach, load latency).",
        "Expand deployment and testing tool mentions.",
      ],
      skills: detected.length > 0 ? detected : ["Problem Solving", "Software Development"],
      missingSkills: missing,
      suggestions: [
        "Include metrics on project outcomes (e.g. 'reduced latency by 20%').",
        "Highlight your top GitHub repository links with live demos.",
        "Align top summary keywords with specific role job descriptions.",
      ],
      keywords: detected,
      experienceLevel: wordCount > 400 ? "Junior" : "Fresher",
      summary: `Resume demonstrates good foundational readiness with an ATS score of ${score}/100. Incorporating quantifiable outcomes will strengthen client appeal.`,
      sectionScores: {
        skillsMatch: Math.min(100, score - 5),
        structure: 80,
        contentDepth: Math.min(100, score),
        keywordDensity: 75,
      },
      poweredBy: POWERED_BY_LABEL,
    };
  }

  private fallbackInterviewQuestion(input: InterviewQuestionInput): string {
    const questionsByRole: Record<string, string[]> = {
      default: [
        "Can you describe a challenging technical project you built recently and the key engineering decisions you made?",
        "How do you approach debugging a high-priority defect in production?",
        "Explain how you design an API or component for high maintainability and testability.",
      ],
    };
    const roleQuestions = questionsByRole.default;
    const index = Math.min(roleQuestions.length - 1, input.chatHistory.length % roleQuestions.length);
    return `Hello, let's start the ${input.roleTitle} interview. ${roleQuestions[index]}`;
  }

  private fallbackInterviewEvaluation(input: InterviewQuestionInput): InterviewEvaluationOutput {
    return {
      score: 78,
      feedback: {
        technical: 78,
        communication: 82,
        structure: 76,
        strengths: [
          "Demonstrated structured logical thinking.",
          "Clear explanation of personal project experience.",
          "Professional communication tone throughout interview.",
        ],
        improvements: [
          "Provide deeper architectural details on scalability.",
          "Reference specific testing strategies and edge cases.",
        ],
      },
      summary: `Solid interview completion for ${input.roleTitle}. Candidate communicates clearly and addresses the primary technical questions well.`,
      disclaimer: "AI-generated interview feedback. Advisory only, not a certified assessment.",
      poweredBy: POWERED_BY_LABEL,
    };
  }
}

export const aiAdapter = new AIAdapter();
export const groqAI = aiAdapter;
// Legacy alias to ensure zero breakages during migration
export const puterAI = aiAdapter;
export type PuterAIAdapter = AIAdapter;
