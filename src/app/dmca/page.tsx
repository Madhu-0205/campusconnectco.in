import type { Metadata } from "next";

import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "DMCA & Copyright Policy | CampusConnectCo",
  description:
    "Learn about CampusConnectCo's DMCA copyright policy, how to submit a notice of infringement, counter-notice procedures, and our Designated Agent contact details.",
  alternates: {
    canonical: "https://www.campusconnectco.in/dmca",
  },
};

const sections = [
  { id: "overview", title: "1. Policy Overview" },
  { id: "designated-agent", title: "2. Designated Agent" },
  { id: "takedown-notice", title: "3. Submitting a Notice of Infringement" },
  { id: "counter-notice", title: "4. Counter-Notification Procedure" },
  { id: "repeat-infringers", title: "5. Repeat Infringer Policy" },
  { id: "disclaimer", title: "6. Legal Disclaimers & Directory Status" },
];

export default function DmcaPage() {
  const agentName = process.env.DMCA_AGENT_NAME || "Information pending verification";
  const agentOrg = process.env.DMCA_AGENT_ORGANIZATION || "CampusConnectCo";
  const agentAddress = process.env.DMCA_AGENT_ADDRESS || process.env.COMPANY_PHYSICAL_POSTAL_ADDRESS || "Information pending verification";
  const agentPhone = process.env.DMCA_AGENT_PHONE || "Information pending verification";
  const agentEmail = process.env.DMCA_AGENT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "dmca@campusconnectco.in";
  const uscoReg = process.env.DMCA_USCO_REGISTRATION_NUMBER || "Registration pending formal filing with U.S. Copyright Office Directory (Safe Harbor protections not yet claimed)";

  const isPendingVerification = !process.env.DMCA_AGENT_NAME || !process.env.DMCA_USCO_REGISTRATION_NUMBER;

  return (
    <LegalLayout
      title="DMCA &amp; Copyright Policy"
      lastUpdated="September 21, 2026"
      sections={sections}
    >
      <section id="overview">
        <h2>1. Policy Overview</h2>
        {isPendingVerification && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4 text-amber-600 dark:text-amber-400 text-sm">
            <strong>Notice on Registration Status:</strong> Formal Designated Agent registration with the U.S. Copyright Office Online Directory is currently in progress. While copyright inquiries sent to the contact channels below will be reviewed and acted upon in good faith under our internal operating procedure, statutory Safe Harbor immunity is not claimed until official registration is completed.
          </div>
        )}
        <p>
          CampusConnectCo operates an online marketplace and community network connecting students, educational institutions, and startups. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512, &quot;DMCA&quot;) and applicable intellectual property laws, CampusConnectCo maintains an expeditious takedown procedure for claimed copyright infringement occurring on our Services.
        </p>
        <p>
          We will respond expeditiously to valid, qualified notices of claimed copyright infringement committed using the CampusConnectCo service that are reported to our Designated Copyright Agent identified below.
        </p>
      </section>

      <section id="designated-agent">
        <h2>2. Designated Copyright Agent</h2>
        <p>
          Notifications of claimed copyright infringement should be sent to our Designated Agent at the contact details below:
        </p>
        <div className="bg-surface-2 border border-border rounded-2xl p-6 my-4 space-y-2 text-sm">
          <p><strong>Designated Agent / Title:</strong> {agentName}</p>
          <p><strong>Organization:</strong> {agentOrg}</p>
          <p><strong>Mailing Address:</strong> {agentAddress}</p>
          <p><strong>Telephone:</strong> {agentPhone}</p>
          <p><strong>Email:</strong> <a href={`mailto:${agentEmail}`} className="text-primary hover:underline font-bold">{agentEmail}</a></p>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            <strong>U.S. Copyright Office Status:</strong> {uscoReg}
          </p>
        </div>
      </section>

      <section id="takedown-notice">
        <h2>3. Submitting a Notice of Infringement</h2>
        <p>
          Pursuant to 17 U.S.C. § 512(c)(3), to be effective, a notification of claimed copyright infringement must be in writing and include substantially the following information:
        </p>
        <ol className="list-decimal pl-6 space-y-2 my-4 text-sm leading-relaxed">
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works.</li>
          <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (such as the specific URL).</li>
          <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an email address.</li>
          <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Please note that under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages, including costs and attorneys&apos; fees.
        </p>
      </section>

      <section id="counter-notice">
        <h2>4. Counter-Notification Procedure</h2>
        <p>
          If you believe that your user content was removed or disabled as a result of mistake or misidentification, you may submit a written counter-notification pursuant to 17 U.S.C. § 512(g)(3) to our Designated Agent containing:
        </p>
        <ol className="list-decimal pl-6 space-y-2 my-4 text-sm leading-relaxed">
          <li>Your physical or electronic signature.</li>
          <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access was disabled.</li>
          <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.</li>
          <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal or competent judicial district for your address (or if outside the jurisdiction, where CampusConnectCo may be found), and that you will accept service of process from the person who provided the original takedown notice or an agent of such person.</li>
        </ol>
        <p className="text-sm leading-relaxed">
          Upon receiving a valid counter-notification, we will promptly provide the complaining party with a copy. Unless the copyright owner files an action seeking a court order within the applicable statutory counter-notice waiting period, access to the material may be restored subject to legal review.
        </p>
      </section>

      <section id="repeat-infringers">
        <h2>5. Repeat Infringer Policy</h2>
        <p>
          In accordance with 17 U.S.C. § 512(i), CampusConnectCo maintains an operational policy to terminate or disable, in appropriate circumstances and at our sole discretion, the accounts of users who are found to repeatedly infringe the intellectual property rights of others.
        </p>
      </section>

      <section id="disclaimer">
        <h2>6. Legal Disclaimers &amp; Directory Status</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This document outlines the public notification process and our internal copyright compliance protocols. Publication of this policy does not constitute formal legal representation, nor does it guarantee limitation of liability without completion of all statutory conditions under 17 U.S.C. § 512, including official registration in the U.S. Copyright Office Online Directory.
        </p>
      </section>
    </LegalLayout>
  );
}
