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
} from"@react-email/components";
import * as React from"react";

interface ApplicationSubmittedEmailProps {
 applicantName: string;
 gigTitle: string;
 applicationId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||"https://campusconnectco.in";

export const ApplicationSubmittedEmail = ({ 
 applicantName, 
 gigTitle
}: ApplicationSubmittedEmailProps) => {
 return (
 <Html>
 <Head />
 <Preview>Your application for {gigTitle} has been submitted!</Preview>
 <Body style={main}>
 <Container style={container}>
 <Heading style={h1}>Application Submitted Successfully</Heading>
 <Text style={text}>
 Hi {applicantName},
 </Text>
 <Text style={text}>
 Great news! Your application for <strong>{gigTitle}</strong> has been successfully submitted to the founder.
 </Text>
 
 <Section style={buttonContainer}>
 <Button
 style={button}
 href={`${baseUrl}/dashboard/student/applications`}
 >
 View Application Status
 </Button>
 </Section>
 
 <Text style={text}>
 The founder will review your application and get back to you soon. Good luck!
 </Text>
 
 <Text style={footer}>
 Best,<br />
 The CampusConnect Team
 </Text>
 </Container>
 </Body>
 </Html>
 );
};

export default ApplicationSubmittedEmail;

const main = {
 backgroundColor:"#ffffff",
 fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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

const footer = {
 color:"#898989",
 fontSize:"14px",
 lineHeight:"22px",
 marginTop:"24px",
};
