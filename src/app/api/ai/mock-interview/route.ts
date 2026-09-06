import { NextResponse } from "next/server";

import { puterAI } from "@/lib/ai/puter";
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
      take: 50,
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
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

    // Call Puter AI to generate opening interview question
    const { question: firstQuestion } = await puterAI.generateInterviewQuestion({
      roleTitle,
      difficulty: difficulty as any,
      chatHistory: []
    });

 const chatHistory = [
 { role:"assistant", content: firstQuestion, timestamp: new Date() }
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
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}

export async function PATCH(req: Request) {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 });

 const body = await req.json();
 const { interviewId, answer } = body;

 if (!interviewId || !answer) {
 return NextResponse.json({ error:"interviewId and answer are required" }, { status: 400 });
 }

 const interview = await prisma.mockInterview.findUnique({
 where: { id: interviewId, userId: user.id }
 });

 if (!interview) {
 return NextResponse.json({ error:"Interview session not found" }, { status: 404 });
 }

 const history = (interview.chatHistory as any[]) || [];
 
 // Append user answer
 history.push({ role:"user", content: answer, timestamp: new Date() });

    // Count how many assistant questions have been asked
    const questionCount = history.filter((m) => m.role === "assistant").length;

    if (questionCount < 5) {
      // Ask next question via Puter AI
      const { question: nextQuestion } = await puterAI.generateInterviewQuestion({
        roleTitle: interview.roleTitle,
        difficulty: interview.difficulty as any,
        chatHistory: history
      });

      history.push({ role: "assistant", content: nextQuestion, timestamp: new Date() });

      await prisma.mockInterview.update({
        where: { id: interviewId },
        data: { chatHistory: history as any }
      });

      return NextResponse.json({
        success: true,
        status: "ongoing",
        nextQuestion,
        questionNumber: questionCount + 1,
        poweredBy: "Puter.js"
      });
    } else {
      // 5 questions completed! Evaluate and grade via Puter AI
      const evaluation = await puterAI.evaluateInterview({
        roleTitle: interview.roleTitle,
        difficulty: interview.difficulty as any,
        chatHistory: history
      });

      const updatedInterview = await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
          chatHistory: history as any,
          score: evaluation.score,
          feedback: evaluation.feedback
        }
      });

 // 3C-1: Seamlessly write session summary into User.resumeData (JSON)
 const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
 let resumeData: any = typeof userRecord?.resumeData === 'object' ? userRecord?.resumeData : {};
 if (!resumeData) resumeData = {};
 if (!resumeData.mockInterviews) resumeData.mockInterviews = [];
 
 resumeData.mockInterviews.push({
 id: updatedInterview.id,
 roleTitle: updatedInterview.roleTitle,
 score: updatedInterview.score,
 date: new Date().toISOString()
 });

 await prisma.user.update({
 where: { id: user.id },
 data: { resumeData: resumeData }
 });

      return NextResponse.json({
        success: true,
        status: "completed",
        data: updatedInterview,
        poweredBy: "Puter.js"
      });
 }
 } catch (error: any) {
 console.error("[MOCK_INTERVIEW_PATCH_ERROR]:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
