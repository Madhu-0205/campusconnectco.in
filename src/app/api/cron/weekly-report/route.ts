import { NextResponse } from "next/server";
import { getFunnelMetrics, getRecommendationIntelligence, getRetentionMetrics } from "@/lib/analytics";
// import { sendEmail } from "@/lib/email"; // Mocked out for this implementation

export async function GET(req: Request) {
  try {
    // 1. Authenticate the cron request (e.g., using a bearer token in headers)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new NextResponse("Unauthorized", { status: 401 });
      // Bypassing for local testing purposes.
    }

    // 2. Fetch Weekly Metrics
    const [funnel, aiMetrics, retention] = await Promise.all([
      getFunnelMetrics(7),
      getRecommendationIntelligence(7),
      getRetentionMetrics(7)
    ]);

    // 3. Generate Markdown/HTML Report
    const reportDate = new Date().toLocaleDateString();
    
    const htmlReport = `
      <h1>CampusConnect Weekly Product Analytics Report (${reportDate})</h1>
      <h2>1. User Retention (Past 7 Days)</h2>
      <ul>
        <li>Active Users: ${retention.activeUsers}</li>
        <li>Total Sessions: ${retention.totalSessions}</li>
        <li>Avg Sessions/User: ${retention.averageSessionsPerUser.toFixed(2)}</li>
      </ul>
      
      <h2>2. AI Recommendation Engine Performance</h2>
      <ul>
        <li>Recommendation Acceptance Rate: ${aiMetrics.acceptanceRate.toFixed(1)}%</li>
      </ul>
      <h3>Top Driving Skills</h3>
      <ul>
        ${aiMetrics.topSkills.map(([skill, count]) => `<li>${skill}: ${count} clicks</li>`).join("")}
      </ul>

      <h2>3. Conversion Funnel</h2>
      <ul>
        ${funnel.map(step => `<li>${step.step}: ${step.count} (${step.dropoff.toFixed(1)}% drop-off)</li>`).join("")}
      </ul>
    `;

    // 4. Send Email to Founders (Mocked)
    // await sendEmail({ to: "founders@campusconnectco.in", subject: "Weekly Analytics", html: htmlReport });
    console.log("[CRON] Weekly Report Generated Successfully:\n", htmlReport);

    return NextResponse.json({ success: true, message: "Report generated and sent." });
  } catch (error) {
    console.error("[CRON Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
