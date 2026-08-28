import { Metadata } from"next";

import LegalLayout from"@/components/legal/LegalLayout";

export const metadata: Metadata = {
 title:"Community Guidelines | CampusConnect",
 description:"Read the CampusConnect Community Guidelines. Learn how we maintain a safe, respectful, and scam-free environment for students and startups.",
 alternates: {
 canonical:"https://campusconnectco.in/community-guidelines",
 },
 openGraph: {
 title:"Community Guidelines | CampusConnect",
 description:"Read the CampusConnect Community Guidelines.",
 url:"https://campusconnectco.in/community-guidelines",
 siteName:"CampusConnect",
 locale:"en_IN",
 type:"website",
 }
};

const sections = [
 { id:"introduction", title:"1. Our Core Values" },
 { id:"respect", title:"2. Respectful Behavior" },
 { id:"scams-fake-jobs", title:"3. No Scams or Fake Jobs" },
 { id:"abuse-discrimination", title:"4. Zero Tolerance for Abuse" },
 { id:"impersonation", title:"5. No Impersonation" },
 { id:"spam", title:"6. No Spam or Misleading Info" },
 { id:"copyright", title:"7. Copyright Violations" },
 { id:"consequences", title:"8. Consequences of Violations" },
 { id:"reporting", title:"9. Reporting & Appeals" },
];

export default function CommunityGuidelinesPage() {
 return (
 <LegalLayout
 title="Community Guidelines"
 lastUpdated="August 1, 2026"
 sections={sections}
 >
 <section id="introduction">
 <h2>1. Our Core Values</h2>
 <p>
 CampusConnect is built to empower students and foster genuine connections between early-career talent and innovative startups. 
 To maintain a safe, highly-productive, and trusting environment, everyone—students, recruiters, and founders—must adhere to these Community Guidelines.
 </p>
 </section>

 <section id="respect">
 <h2>2. Respectful Behavior</h2>
 <p>
 Professionalism is key. We expect all users to communicate with courtesy and respect. Whether you are rejecting an applicant, offering feedback, or asking for mentorship, maintain a professional tone at all times.
 </p>
 </section>

 <section id="scams-fake-jobs">
 <h2>3. No Scams or Fake Jobs</h2>
 <p>
 The platform must be a reliable source of opportunities. We strictly prohibit:
 </p>
 <ul>
 <li>Posting fake, &quot;ghost&quot;, or mlm/pyramid scheme jobs.</li>
 <li>Asking candidates to pay application fees, training fees, or security deposits.</li>
 <li>Offering unpaid work disguised as a full-time job.</li>
 </ul>
 </section>

 <section id="abuse-discrimination">
 <h2>4. Zero Tolerance for Abuse & Discrimination</h2>
 <p>
 CampusConnect is an inclusive space. We have a zero-tolerance policy for:
 </p>
 <ul>
 <li>Hate speech, racism, sexism, or discrimination based on caste, religion, gender, sexual orientation, or disability.</li>
 <li>Harassment, bullying, or threatening language.</li>
 <li>Unwanted romantic or inappropriate personal advances.</li>
 </ul>
 </section>

 <section id="impersonation">
 <h2>5. No Impersonation</h2>
 <p>
 Transparency is critical to career networking. Do not impersonate another person, company, or educational institution. Do not lie about your academic credentials, past work experience, or company representation.
 </p>
 </section>

 <section id="spam">
 <h2>6. No Spam or Misleading Information</h2>
 <p>
 To keep the signal-to-noise ratio high, do not:
 </p>
 <ul>
 <li>Send mass, unsolicited messages (spam) to recruiters or students.</li>
 <li>Post irrelevant links, clickbait, or misleading opportunity descriptions.</li>
 <li>Use automated bots or scripts to apply to jobs en masse or scrape user data.</li>
 </ul>
 </section>

 <section id="copyright">
 <h2>7. Copyright Violations</h2>
 <p>
 Respect intellectual property. Do not upload portfolios, code snippets, or projects that belong to someone else and claim them as your own. Plagiarism is heavily frowned upon and harms your professional reputation.
 </p>
 </section>

 <section id="consequences">
 <h2>8. Consequences of Violations</h2>
 <p>
 Violating these guidelines can result in various actions depending on the severity of the offense, including:
 </p>
 <ul>
 <li>Content removal (deleting the offending post or listing).</li>
 <li>Temporary account suspension.</li>
 <li>Permanent ban from the CampusConnect platform.</li>
 <li>In extreme cases involving fraud or illegal activities, reporting to local law enforcement authorities.</li>
 </ul>
 </section>

 <section id="reporting">
 <h2>9. Reporting & Appeals</h2>
 <p>
 <strong>Reporting:</strong> If you see a job posting, user, or message that violates these guidelines, please use the in-app reporting tools or email us directly at <strong>trust@campusconnectco.in</strong>. Your reports are kept strictly confidential.
 </p>
 <p>
 <strong>Appeals:</strong> If your account was suspended and you believe it was a mistake, you can appeal the decision by contacting our support team within 14 days of the suspension.
 </p>
 </section>
 </LegalLayout>
 );
}
