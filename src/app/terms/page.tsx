import { Metadata } from "next";
import Link from "next/link";

import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
 title:"Terms & Conditions | CampusConnectCo",
 description:"Read the Terms and Conditions for using CampusConnectCo. Learn about user responsibilities, student conduct, and content ownership.",
 alternates: {
 canonical:"https://www.campusconnectco.in/terms",
 },
  openGraph: {
    title: "Terms & Conditions | CampusConnectCo",
    description: "Read the Terms and Conditions for using CampusConnectCo.",
    url: "https://www.campusconnectco.in/terms",
    siteName: "CampusConnectCo",
    locale: "en_IN",
    type: "website",
  }
};

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "eligibility", title: "2. Eligibility & Age Assurance" },
  { id: "account", title: "3. Account Registration" },
  { id: "student-conduct", title: "4. Student Conduct" },
  { id: "employer-responsibilities", title: "5. Employer Responsibilities" },
  { id: "opportunity-listings", title: "6. Opportunity Listings" },
  { id: "intellectual-property", title: "7. Intellectual Property & DMCA" },
  { id: "prohibited-activities", title: "8. Prohibited Activities" },
  { id: "termination", title: "9. Termination" },
  { id: "disclaimer", title: "10. Disclaimer & Liability" },
  { id: "subscription", title: "11. Subscriptions, Automatic Renewal & Cancellation" },
  { id: "changes", title: "12. Changes to Terms" },
  { id: "contact", title: "13. Contact Information" },
];

export default function TermsPage() {
 return (
 <LegalLayout
 title="Terms & Conditions"
 lastUpdated="September 21, 2026"
 sections={sections}
 >
 <section id="introduction">
 <h2>1. Introduction</h2>
 <p>
 Welcome to CampusConnectCo. These Terms & Conditions (&quot;Terms&quot;) govern your access to and use of the CampusConnectCo website, platform, and services (collectively, the &quot;Services&quot;). 
 By creating an account, accessing, or using our Services, you agree to be bound by these Terms and our Privacy Policy.
 </p>
 <p>
 CampusConnectCo is a platform designed to bridge the gap between students, educational institutions, and employers. We facilitate connections for internships, gigs, hackathons, and networking.
 </p>
 </section>

 <section id="eligibility">
 <h2>2. Eligibility &amp; Age Assurance</h2>
 <p>
 You must be at least 13 years of age to create an account on CampusConnectCo. By registering, you self-attest that you meet this minimum age requirement. If you are under 18 years of age (or the legal age of majority in your jurisdiction), you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf before you enter into binding gig agreements, offer services, or receive financial disbursements.
 </p>
 <p>
 If you reside in a jurisdiction where the age of digital consent under applicable privacy legislation (such as the EU GDPR) is higher than 13, you represent that you meet the minimum age of digital consent required in your country or have obtained verifiable parental authorization.
 </p>
 </section>

 <section id="account">
 <h2>3. Account Registration</h2>
 <p>
 To access certain features, you must register for an account. You agree to:
 </p>
 <ul>
 <li>Provide accurate, current, and complete information during registration.</li>
 <li>Maintain the security of your password and account credentials.</li>
 <li>Promptly update any information to keep it accurate and complete.</li>
 <li>Accept full responsibility for all activities that occur under your account.</li>
 </ul>
 <p>
 Creating fake accounts, impersonating others, or providing false academic credentials is strictly prohibited and will result in immediate account termination.
 </p>
 </section>

 <section id="student-conduct">
 <h2>4. Student Conduct & User Responsibilities</h2>
 <p>
 As a student or job-seeking user on CampusConnectCo, you represent yourself professionally. You agree to:
 </p>
 <ul>
 <li>Submit accurate resumes, portfolios, and application materials.</li>
 <li>Communicate respectfully with employers, mentors, and peers.</li>
 <li>Honor commitments regarding interviews, offers, and internships.</li>
 <li>Use the platform exclusively for career development, learning, and professional networking.</li>
 </ul>
 </section>

 <section id="employer-responsibilities">
 <h2>5. Employer & Startup Responsibilities</h2>
 <p>
 Employers, recruiters, and startups using CampusConnectCo to hire or recruit talent agree to:
 </p>
 <ul>
 <li>Provide accurate and transparent information regarding job roles, stipends, and working conditions.</li>
 <li>Comply with all applicable labor laws and employment regulations in India (or your respective jurisdiction).</li>
 <li>Not charge students any fees, deposits, or hidden costs for applying or securing an internship or job.</li>
 <li>Respect student privacy and use candidate data solely for recruitment purposes.</li>
 </ul>
 </section>

 <section id="opportunity-listings">
 <h2>6. Opportunity Listings</h2>
 <p>
 CampusConnectCo aggregates and hosts opportunities (internships, hackathons, jobs). While we strive for quality, we do not guarantee the validity, safety, or outcome of any third-party opportunity. Users are advised to exercise due diligence before sharing sensitive information or accepting offers.
 </p>
 </section>

      <section id="intellectual-property">
        <h2>7. Intellectual Property &amp; Content Ownership</h2>
        <p>
          <strong>Your Content:</strong> You retain ownership of the content you post (e.g., resumes, portfolios, project descriptions). By posting, you grant CampusConnectCo a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content to facilitate the Services.
        </p>
        <p>
          <strong>CampusConnectCo Content:</strong> The CampusConnectCo logo, design, code, and proprietary algorithms are the intellectual property of CampusConnectCo. You may not copy, modify, or distribute our intellectual property without written consent.
        </p>
        <p>
          <strong>Copyright Infringement &amp; DMCA:</strong> CampusConnectCo respects intellectual property rights. If you believe any user-submitted content infringes your copyrighted work, please review our dedicated <Link href="/dmca" className="text-primary hover:underline font-medium">DMCA &amp; Copyright Policy</Link> for statutory instructions on submitting a notice of claimed infringement to our Designated Agent.
        </p>
      </section>

      <section id="prohibited-activities">
        <h2>8. Prohibited Activities</h2>
        <p>You agree NOT to engage in any of the following activities on CampusConnectCo:</p>
        <ul>
          <li><strong>Fraud &amp; Scams:</strong> Posting fake job listings, phishing, or attempting to extract money from users.</li>
          <li><strong>Spam:</strong> Sending unsolicited promotional messages, bulk emails, or irrelevant links.</li>
          <li><strong>Harassment:</strong> Engaging in bullying, hate speech, discrimination, or abusive behavior toward any user.</li>
          <li><strong>System Abuse:</strong> Scraping data, bypassing security measures, or distributing malware.</li>
        </ul>
      </section>

      <section id="termination">
        <h2>9. Termination</h2>
        <p>
          CampusConnectCo reserves the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms, engaged in fraudulent behavior, or created a risk to the platform or other users.
        </p>
      </section>

      <section id="disclaimer">
        <h2>10. Disclaimer &amp; Limitation of Liability</h2>
        <p>
          The Services are provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis. CampusConnectCo disclaims all warranties, express or implied, including the implied warranties of merchantability and fitness for a particular purpose.
        </p>
        <p>
          To the maximum extent permitted by law, CampusConnectCo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, your interactions with other users, or any employment outcomes.
        </p>
      </section>

      <section id="subscription">
        <h2>11. Subscriptions, Automatic Renewal &amp; Cancellation</h2>
        <p>
          Certain features, tiers, and tools (such as Employer Growth or Launchpad tiers) may be offered on a recurring paid subscription basis.
        </p>
        <p>
          <strong>Automatic Renewal:</strong> Paid subscriptions automatically renew at the end of each billing cycle (e.g., monthly) at the then-current subscription fee until explicitly cancelled by you. By subscribing, you authorize recurring charges to your designated payment method.
        </p>
        <p>
          <strong>Cancellation Instructions:</strong> You may cancel your subscription at any time online through your Account Settings &gt; Billing, or by submitting a written request to support@campusconnectco.in before your next scheduled billing date.
        </p>
        <p>
          <strong>Effect of Cancellation:</strong> Cancellation takes effect at the conclusion of your current prepaid billing cycle. You will retain access to your paid tier through the end of that period. We do not charge cancellation fees or impose multi-step cancellation barriers.
        </p>
      </section>

      <section id="changes">
        <h2>12. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material changes, we will notify you via email or a prominent notice on the platform. Your continued use of CampusConnectCo after such updates constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section id="contact">
        <h2>13. Contact Information</h2>
        <p>
          If you have any questions, concerns, or legal inquiries regarding these Terms &amp; Conditions, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> legal@campusconnectco.in<br />
          <strong>Address:</strong> CampusConnectCo Legal Department, India
        </p>
      </section>
 </LegalLayout>
 );
}
