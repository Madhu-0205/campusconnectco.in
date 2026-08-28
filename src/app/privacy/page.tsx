import { Metadata } from"next";
import Link from"next/link";

import LegalLayout from"@/components/legal/LegalLayout";

export const metadata: Metadata = {
 title:"Privacy Policy | CampusConnect",
 description:"Learn how CampusConnect collects, uses, and protects your personal information. GDPR-aligned privacy practices for students and employers.",
 alternates: {
 canonical:"https://campusconnectco.in/privacy",
 },
 openGraph: {
 title:"Privacy Policy | CampusConnect",
 description:"Learn how CampusConnect collects, uses, and protects your personal information.",
 url:"https://campusconnectco.in/privacy",
 siteName:"CampusConnect",
 locale:"en_IN",
 type:"website",
 }
};

const sections = [
 { id:"introduction", title:"1. Introduction" },
 { id:"information-we-collect", title:"2. Information We Collect" },
 { id:"how-we-use", title:"3. How We Use Your Information" },
 { id:"authentication-cookies", title:"4. Authentication & Cookies" },
 { id:"third-party", title:"5. Third-Party Services" },
 { id:"data-retention", title:"6. Data Retention & Deletion" },
 { id:"security", title:"7. Security" },
 { id:"children-privacy", title:"8. Children's Privacy" },
 { id:"user-rights", title:"9. Your Privacy Rights" },
 { id:"contact", title:"10. Contact Us" },
];

export default function PrivacyPage() {
 return (
 <LegalLayout
 title="Privacy Policy"
 lastUpdated="August 1, 2026"
 sections={sections}
 >
 <section id="introduction">
 <h2>1. Introduction</h2>
 <p>
 At CampusConnect (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), your privacy is our priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (campusconnectco.in) and use our platform. 
 By using CampusConnect, you consent to the data practices described in this policy, which is aligned with standard data protection principles including the GDPR and Indian IT regulations.
 </p>
 </section>

 <section id="information-we-collect">
 <h2>2. Information We Collect</h2>
 <p>We collect information to provide better services to all our users. This includes:</p>
 <ul>
 <li><strong>Personal Information:</strong> Name, email address, college/university, graduation year, and profile picture.</li>
 <li><strong>Profile Data:</strong> Resumes, portfolios, skills, bios, GitHub/LinkedIn links, and career goals that you choose to upload.</li>
 <li><strong>Employer Information:</strong> Company name, registration details, and recruiter contact information (if you are a startup or client).</li>
 <li><strong>Usage Data:</strong> IP addresses, browser type, device information, and pages visited, collected automatically via analytics.</li>
 <li><strong>Location Data:</strong> Approximate location based on IP address to show relevant local opportunities.</li>
 </ul>
 </section>

 <section id="how-we-use">
 <h2>3. How We Use Your Information</h2>
 <p>Your information is used for the following purposes:</p>
 <ul>
 <li>To create, manage, and authenticate your account.</li>
 <li>To match students with relevant internships, jobs, and hackathons.</li>
 <li>To allow employers to view candidate profiles and resumes during the application process.</li>
 <li>To send important email notifications regarding account security, application updates, and (if opted-in) marketing newsletters.</li>
 <li>To improve our platform, algorithms, and user experience.</li>
 </ul>
 </section>

 <section id="authentication-cookies">
 <h2>4. Authentication & Cookies</h2>
 <p>
 We use Supabase for secure authentication. When you log in (via email/password or Google), secure session tokens are generated. 
 </p>
 <p>
 We also use cookies to store your preferences, maintain your logged-in state, and analyze site traffic. For more detailed information, please review our <Link href="/cookies">Cookie Policy</Link>.
 </p>
 </section>

 <section id="third-party">
 <h2>5. Third-Party Services</h2>
 <p>
 We do not sell your personal data. We may share necessary information with trusted third-party service providers (like Supabase for database, Vercel for hosting, and analytics providers) strictly to operate our platform. These providers are bound by strict confidentiality and data protection agreements.
 </p>
 </section>

 <section id="data-retention">
 <h2>6. Data Retention & Deletion</h2>
 <p>
 We retain your data for as long as your account is active or as needed to provide you services.
 </p>
 <p>
 <strong>Account Deletion:</strong> You can delete your account at any time through your account settings. Upon deletion, your personal data, uploaded resumes, and profile information will be permanently removed from our active databases within 30 days, except where retention is required by law or for legitimate dispute resolution.
 </p>
 </section>

 <section id="security">
 <h2>7. Security</h2>
 <p>
 We implement robust technical and organizational security measures to protect your data, including encrypted connections (HTTPS), secure password hashing, and restricted database access. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
 </p>
 </section>

 <section id="children-privacy">
 <h2>8. Children&apos;s Privacy</h2>
 <p>
 CampusConnect is intended for college students and young professionals. We do not knowingly collect personal information from children under the age of 16. If we become aware that a child under 16 has provided us with personal information, we will take steps to delete it immediately.
 </p>
 </section>

 <section id="user-rights">
 <h2>9. Your Privacy Rights</h2>
 <p>Depending on your jurisdiction, you have the right to:</p>
 <ul>
 <li>Access the personal data we hold about you.</li>
 <li>Request correction of inaccurate or incomplete data.</li>
 <li>Request deletion of your data (Right to be Forgotten).</li>
 <li>Opt-out of marketing communications at any time.</li>
 </ul>
 </section>

 <section id="contact">
 <h2>10. Contact Us</h2>
 <p>
 If you have any questions about this Privacy Policy, your data rights, or how we handle your personal information, please contact our Data Protection Officer at:
 </p>
 <p>
 <strong>Email:</strong> privacy@campusconnectco.in<br />
 <strong>Address:</strong> CampusConnect Privacy Team, India
 </p>
 </section>
 </LegalLayout>
 );
}
