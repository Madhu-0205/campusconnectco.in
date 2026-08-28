import { Metadata } from"next";

import LegalLayout from"@/components/legal/LegalLayout";

export const metadata: Metadata = {
 title:"Cookie Policy | CampusConnect",
 description:"Learn how CampusConnect uses cookies to improve your experience.",
 alternates: {
 canonical:"https://campusconnectco.in/cookies",
 },
 openGraph: {
 title:"Cookie Policy | CampusConnect",
 description:"Learn how CampusConnect uses cookies to improve your experience.",
 url:"https://campusconnectco.in/cookies",
 siteName:"CampusConnect",
 locale:"en_IN",
 type:"website",
 }
};

const sections = [
 { id:"what-are-cookies", title:"1. What Are Cookies?" },
 { id:"essential-cookies", title:"2. Essential Cookies" },
 { id:"analytics-cookies", title:"3. Analytics Cookies" },
 { id:"functional-cookies", title:"4. Functional Cookies" },
 { id:"advertising-cookies", title:"5. Advertising Cookies" },
 { id:"cookie-management", title:"6. Managing Cookies" },
];

export default function CookiePolicyPage() {
 return (
 <LegalLayout
 title="Cookie Policy"
 lastUpdated="August 1, 2026"
 sections={sections}
 >
 <section id="what-are-cookies">
 <h2>1. What Are Cookies?</h2>
 <p>
 Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website. 
 They are widely used to make websites work efficiently, as well as to provide reporting information and personalized experiences.
 </p>
 </section>

 <section id="essential-cookies">
 <h2>2. Essential Cookies (Strictly Necessary)</h2>
 <p>
 These cookies are required for CampusConnect to function properly. They cannot be switched off in our systems. They are usually set in response to actions made by you, such as logging in, filling in forms, or setting your privacy preferences.
 </p>
 <p>
 For example, we use Supabase authentication cookies to keep you securely logged in as you navigate between pages.
 </p>
 </section>

 <section id="analytics-cookies">
 <h2>3. Analytics Cookies</h2>
 <p>
 These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
 They help us know which pages are the most and least popular and see how visitors move around the platform. All information these cookies collect is aggregated and anonymous.
 </p>
 </section>

 <section id="functional-cookies">
 <h2>4. Functional Cookies</h2>
 <p>
 These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. 
 If you do not allow these cookies, some services may not function correctly.
 </p>
 </section>

 <section id="advertising-cookies">
 <h2>5. Future Advertising Cookies</h2>
 <p>
 Currently, CampusConnect does not use intrusive advertising or tracking cookies for third-party ad targeting. If we ever decide to implement such cookies in the future to keep the platform free for students, we will update this policy and explicitly ask for your consent before placing them on your device.
 </p>
 </section>

 <section id="cookie-management">
 <h2>6. Cookie Management & Browser Settings</h2>
 <p>
 You have the right to decide whether to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.
 </p>
 <p>To learn how to manage cookies on popular browsers, visit:</p>
 <ul>
 <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
 <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
 <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
 </ul>
 <p>
 Please note that disabling Essential Cookies will prevent you from logging into CampusConnect and using core features of the platform.
 </p>
 </section>
 </LegalLayout>
 );
}
