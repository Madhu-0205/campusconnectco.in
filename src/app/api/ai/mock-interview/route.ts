import { NextResponse } from "next/server";

import { getOpenAI, getChatModel } from "@/lib/ai/client";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;
        const { user } = auth;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const interviews = await prisma.mockInterview.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: interviews });
    } catch (error: any) {
        console.error("[MOCK_INTERVIEW_GET_ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;
        const { user } = auth;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { roleTitle, difficulty } = body;

        if (!roleTitle || !difficulty) {
            return NextResponse.json({ error: "roleTitle and difficulty are required" }, { status: 400 });
        }

        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: getChatModel(),
            messages: [
                {
                    role: "system",
                    content: `You are a strict technical interviewer at a high-growth startup conducting a mock interview for the role of ${roleTitle}.
The candidate wants a ${difficulty} difficulty interview.
Ask the first technical question. Introduce yourself briefly (under 20 words), and then ask a challenging question appropriate for ${difficulty} difficulty level.
Ask only ONE question. Do not output anything else.`
                }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const firstQuestion = response.choices[0]?.message?.content?.trim() || "Let's start. Please explain what experience you have with this role.";

        const chatHistory = [
            { role: "assistant", content: firstQuestion, timestamp: new Date() }
        ];

        const interview = await prisma.mockInterview.create({
            data: {
                userId: user.id,
                roleTitle,
                difficulty,
                chatHistory: chatHistory as any,
            }
        });

        return NextResponse.json({ success: true, data: interview });
    } catch (error: any) {
        console.error("[MOCK_INTERVIEW_POST_ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;
        const { user } = auth;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { interviewId, answer } = body;

        if (!interviewId || !answer) {
            return NextResponse.json({ error: "interviewId and answer are required" }, { status: 400 });
        }

        const interview = await prisma.mockInterview.findUnique({
            where: { id: interviewId, userId: user.id }
        });

        if (!interview) {
            return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
        }

        const history = (interview.chatHistory as any[]) || [];
        
        // Append user answer
        history.push({ role: "user", content: answer, timestamp: new Date() });

        // Count how many assistant questions have been asked
        const questionCount = history.filter(m => m.role === "assistant").length;

        const openai = getOpenAI();

        if (questionCount < 5) {
            // Ask next question
            const formattedMessages = history.map(h => ({
                role: h.role as "user" | "assistant",
                content: h.content
            }));

            const response = await openai.chat.completions.create({
                model: getChatModel(),
                messages: [
                    {
                        role: "system",
                        content: `You are conducting a technical interview for the role of ${interview.roleTitle} at ${interview.difficulty} difficulty.
Ask the next question based on the conversation so far. If their previous answer was incomplete or incorrect, ask a follow-up or provide a hint, then ask the next question.
Ask ONLY one question at a time. Keep it concise.`
                    },
                    ...formattedMessages
                ],
                temperature: 0.7,
                max_tokens: 150,
            });

            const nextQuestion = response.choices[0]?.message?.content?.trim() || "Could you expand on that?";
            
            history.push({ role: "assistant", content: nextQuestion, timestamp: new Date() });

            await prisma.mockInterview.update({
                where: { id: interviewId },
                data: { chatHistory: history as any }
            });

            return NextResponse.json({
                success: true,
                status: "ongoing",
                nextQuestion,
                questionNumber: questionCount + 1
            });
        } else {
            // 5 questions completed! Evaluate and grade
            const formattedMessages = history.map(h => ({
                role: h.role as "user" | "assistant",
                content: h.content
            }));

            const response = await openai.chat.completions.create({
                model: getChatModel(),
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `Evaluate this mock interview transcript for the role of ${interview.roleTitle} at ${interview.difficulty} difficulty.
Return a JSON object containing:
- score: number (overall score 0-100)
- feedback: a JSON object containing:
  - technical: number (score 0-100 for technical correctness of answers)
  - communication: number (score 0-100 for clarity, explanation style, structure)
  - structure: number (score 0-100 for logical flow and approach)
  - strengths: string[] (top 3 strengths demonstrated)
  - improvements: string[] (top 3 areas for improvement)

No preamble. Return ONLY a valid JSON object.`
                    },
                    ...formattedMessages
                ],
                temperature: 0.5,
            });

            const rawContent = response.choices[0]?.message?.content || "{}";
            let parsedData;
            try {
                parsedData = JSON.parse(rawContent);
            } catch (err) {
                console.error("Failed to parse LLM grading output:", rawContent);
                parsedData = {
                    score: 70,
                    feedback: {
                        technical: 70,
                        communication: 70,
                        structure: 70,
                        strengths: ["Completed the full interview", "Good effort answering all questions"],
                        improvements: ["Provide more code syntax explanations", "Clarify architecture decisions"]
                    }
                };
            }

            const updatedInterview = await prisma.mockInterview.update({
                where: { id: interviewId },
                data: {
                    chatHistory: history as any,
                    score: parsedData.score || 70,
                    feedback: parsedData.feedback || {},
                }
            });

            return NextResponse.json({
                success: true,
                status: "completed",
                data: updatedInterview
            });
        }
    } catch (error: any) {
        console.error("[MOCK_INTERVIEW_PATCH_ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
