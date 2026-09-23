import {
 Body,
 Button,
 Container,
 Head,
 Heading,
 Html,
 Preview,
 Section,
 Text,
} from "@react-email/components";
import * as React from "react";

import { EmailFooter } from "./EmailFooter";

interface WelcomeEmailProps {
 name: string;
 role: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.campusconnectco.in";

export const WelcomeEmail = ({ name, role }: WelcomeEmailProps) => {
 const isStudent = role === "STUDENT";
 
 return (
 <Html>
 <Head />
 <Preview>Your CampusConnectCo account has been created</Preview>
 <Body style={main}>
 <Container style={container}>
 <Heading style={h1}>Account Created</Heading>
 <Text style={text}>
 Hello {name},
 </Text>
 <Text style={text}>
 Your CampusConnectCo account has been successfully created. You can now access your dashboard and manage your account settings.
 </Text>
 
 <Section style={buttonContainer}>
 <Button
 style={button}
 href={`${baseUrl}/dashboard/${isStudent ? 'student' : 'founder'}`}
 >
 Go to your Dashboard
 </Button>
 </Section>
 
 <Text style={text}>
 If you did not create this account, please contact our support team immediately.
 </Text>
 
 <EmailFooter isMarketing={false} baseUrl={baseUrl} />
 </Container>
 </Body>
 </Html>
 );
};

export default WelcomeEmail;

const main = {
 backgroundColor: "#ffffff",
 fontFamily:
 '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
 margin:"0 auto",
 padding:"20px 0 48px",
 width:"580px",
};

const h1 = {
 color:"#333",
 fontSize:"24px",
 fontWeight:"bold",
 paddingTop:"32px",
 paddingBottom:"16px",
};

const text = {
 color:"#333",
 fontSize:"16px",
 lineHeight:"26px",
};

const buttonContainer = {
 padding:"24px 0",
};

const button = {
 backgroundColor:"#1FA971",
 borderRadius:"8px",
 color:"#fff",
 fontSize:"16px",
 fontWeight:"bold",
 textDecoration:"none",
 textAlign:"center" as const,
 display:"block",
 padding:"14px 24px",
};

