import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | CampusConnect",
  description: "Read the Terms and Conditions for using CampusConnect. Learn about user responsibilities, student conduct, and content ownership.",
  alternates: {
    canonical: "https://campusconnectco.in/terms",
  },
  openGraph: {
    title: "Terms & Conditions | CampusConnect",
    description: "Read the Terms and Conditions for using CampusConnect.",
    url: "https://campusconnectco.in/terms",
    siteName: "CampusConnect",
    locale: "en_IN",
    type: "website",
  }
};

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "account", title: "3. Account Registration" },
  { id: "student-conduct", title: "4. Student Conduct" },
  { id: "employer-responsibilities", title: "5. Employer Responsibilities" },
  { id: "opportunity-listings", title: "6. Opportunity Listings" },
  { id: "intellectual-property", title: "7. Intellectual Property" },
  { id: "prohibited-activities", title: "8. Prohibited Activities" },
  { id: "termination", title: "9. Termination" },
  { id: "disclaimer", title: "10. Disclaimer & Liability" },
  { id: "changes", title: "11. Changes to Terms" },
  { id: "contact", title: "12. Contact Information" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      lastUpdated="August 1, 2026"
      sections={sections}
    >
      <section id="introduction">
        <h2>1. Introduction</h2>
        <p>
          Welcome to CampusConnect. These Terms & Conditions ("Terms") govern your access to and use of the CampusConnect website, platform, and services (collectively, the "Services"). 
          By creating an account, accessing, or using our Services, you agree to be bound by these Terms and our Privacy Policy.
        </p>
        <p>
          CampusConnect is a platform designed to bridge the gap between students, educational institutions, and employers. We facilitate connections for internships, jobs, hackathons, and networking.
        </p>
      </section>

      <section id="eligibility">
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 16 years old to create an account on CampusConnect. By using our Services, you represent and warrant that you meet this minimum age requirement and have the legal capacity to enter into these Terms.
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
          As a student or job-seeking user on CampusConnect, you represent yourself professionally. You agree to:
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
          Employers, recruiters, and startups using CampusConnect to hire or recruit talent agree to:
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
          CampusConnect aggregates and hosts opportunities (internships, hackathons, jobs). While we strive for quality, we do not guarantee the validity, safety, or outcome of any third-party opportunity. Users are advised to exercise due diligence before sharing sensitive information or accepting offers.
        </p>
      </section>

      <section id="intellectual-property">
        <h2>7. Intellectual Property & Content Ownership</h2>
        <p>
          <strong>Your Content:</strong> You retain ownership of the content you post (e.g., resumes, portfolios, project descriptions). By posting, you grant CampusConnect a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content to facilitate the Services.
        </p>
        <p>
          <strong>CampusConnect Content:</strong> The CampusConnect logo, design, code, and proprietary algorithms are the intellectual property of CampusConnect. You may not copy, modify, or distribute our intellectual property without written consent.
        </p>
      </section>

      <section id="prohibited-activities">
        <h2>8. Prohibited Activities</h2>
        <p>You agree NOT to engage in any of the following activities on CampusConnect:</p>
        <ul>
          <li><strong>Fraud & Scams:</strong> Posting fake job listings, phishing, or attempting to extract money from users.</li>
          <li><strong>Spam:</strong> Sending unsolicited promotional messages, bulk emails, or irrelevant links.</li>
          <li><strong>Harassment:</strong> Engaging in bullying, hate speech, discrimination, or abusive behavior toward any user.</li>
          <li><strong>System Abuse:</strong> Scraping data, bypassing security measures, or distributing malware.</li>
        </ul>
      </section>

      <section id="termination">
        <h2>9. Termination</h2>
        <p>
          CampusConnect reserves the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms, engaged in fraudulent behavior, or created a risk to the platform or other users.
        </p>
      </section>

      <section id="disclaimer">
        <h2>10. Disclaimer & Limitation of Liability</h2>
        <p>
          The Services are provided on an "AS-IS" and "AS-AVAILABLE" basis. CampusConnect disclaims all warranties, express or implied, including the implied warranties of merchantability and fitness for a particular purpose.
        </p>
        <p>
          To the maximum extent permitted by law, CampusConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, your interactions with other users, or any employment outcomes.
        </p>
      </section>

      <section id="changes">
        <h2>11. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material changes, we will notify you via email or a prominent notice on the platform. Your continued use of CampusConnect after such updates constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section id="contact">
        <h2>12. Contact Information</h2>
        <p>
          If you have any questions, concerns, or legal inquiries regarding these Terms & Conditions, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> legal@campusconnectco.in<br />
          <strong>Address:</strong> CampusConnect Legal Department, India
        </p>
      </section>
    </LegalLayout>
  );
}
