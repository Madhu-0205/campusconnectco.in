import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailFooterProps {
  isMarketing?: boolean;
  unsubscribeUrl?: string;
  baseUrl?: string;
}

export const EmailFooter = ({
  isMarketing = false,
  unsubscribeUrl,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.campusconnectco.in",
}: EmailFooterProps) => {
  const companyAddress = process.env.COMPANY_PHYSICAL_POSTAL_ADDRESS;

  return (
    <Section style={footerContainer}>
      <Hr style={hr} />

      {companyAddress && (
        <Text style={footerAddress}>
          {companyAddress}
        </Text>
      )}

      <Text style={footerLinks}>
        {isMarketing && unsubscribeUrl && (
          <>
            <Link href={unsubscribeUrl} style={link}>
              Unsubscribe from marketing emails
            </Link>
            {" • "}
          </>
        )}
        <Link href={`${baseUrl}/privacy`} style={link}>
          Privacy Policy
        </Link>
        {" • "}
        <Link href={`${baseUrl}/terms`} style={link}>
          Terms of Service
        </Link>
      </Text>

      <Text style={footerDisclaimer}>
        {isMarketing
          ? "You received this marketing email because you opted in to receive updates from CampusConnectCo."
          : "This is an essential transactional notification concerning your account activity or platform security."}
      </Text>
    </Section>
  );
};

export default EmailFooter;

const footerContainer = {
  marginTop: "32px",
  paddingTop: "16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footerAddress = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "4px 0",
};

const footerLinks = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "8px 0",
};

const link = {
  color: "#1FA971",
  textDecoration: "underline",
};

const footerDisclaimer = {
  color: "#9ca3af",
  fontSize: "11px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "8px 0 0",
};
