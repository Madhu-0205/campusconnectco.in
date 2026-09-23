/**
 * Server-Side Identity Assertion Endpoint for Automation Agents
 * CampusConnectCo — Phase 15
 *
 * Exposes authenticated session identity to verify that the active browser session
 * belongs strictly to the dedicated automation bot account (opportunity-bot@campusconnectco.in).
 */

import { NextResponse } from "next/server";
import { getSession, isAutomationBotEmail } from "@/lib/auth-checks";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json(
      { authenticated: false, isBot: false, email: null },
      { status: 401 }
    );
  }

  const isBot = isAutomationBotEmail(user.email);

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email || null,
    isBot
  });
}
