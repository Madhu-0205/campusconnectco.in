import mammoth from "mammoth";
import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

import { protectApi } from "@/lib/auth-checks";

/**
 * PRODUCTION-READY RESUME PARSER
 * This API handles PDF, DOCX, and TXT files using specialized libraries.
 * It uses the modern ESM-compatible 'pdf-parse' (v2+) fork.
 */

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    // Server-side size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Strict type extension & MIME validations
    const isAllowedExt = fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".txt");
    const isAllowedMime = fileType === "application/pdf" || 
                         fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                         fileType === "text/plain";

    if (!isAllowedExt && !isAllowedMime) {
      return NextResponse.json(
        { error: `Unsupported file type. Please use PDF, DOCX, or TXT.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = "";

    try {
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        // --- PDF HANDLING (Modern pdf-parse v2+ flow) ---
        // The modern fork uses a class-based architecture for better ESM support.
        const parser = new PDFParse({ 
          data: buffer,
          // Low verbosity helps avoid noise in server logs
          verbosity: 0 
        });
        
        const result = await parser.getText();
        extractedText = result.text;
        
        // Always destroy the parser to free up memory (important for long-running servers)
        await parser.destroy();
        
      } else if (
        fileName.endsWith(".docx") ||
        fileType.includes("wordprocessingml")
      ) {
        // --- DOCX HANDLING (Mammoth) ---
        // Mammoth is standard for extracting text from Word documents.
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        
      } else if (fileName.endsWith(".txt") || fileType === "text/plain") {
        // --- TXT HANDLING ---
        extractedText = buffer.toString("utf-8");
        
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileType}. Please use PDF, DOCX, or TXT.` },
          { status: 400 }
        );
      }

      // Basic validation of output
      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json(
          { 
            error: "Insufficient text extracted.", 
            details: "The file might be an image-based PDF (OCR required) or protected by a password." 
          },
          { status: 422 }
        );
      }

      // Return parsed text (with a reasonable limit for prompt safety)
      return NextResponse.json({ 
        success: true, 
        text: extractedText.slice(0, 10000),
        charCount: extractedText.length
      });

    } catch (parseError: any) {
      console.error("[Parser Internal Error]:", parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse file content", 
          details: parseError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("[API Route Error]:", error);
    return NextResponse.json(
      { error: "Internal server error during file processing" },
      { status: 500 }
    );
  }
}
