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

interface ApplicationStatusEmailProps {
    applicantName: string;
    gigTitle: string;
    status: "ACCEPTED" | "REJECTED";
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

export const ApplicationStatusEmail = ({ 
    applicantName, 
    gigTitle,
    status
}: ApplicationStatusEmailProps) => {
    const isAccepted = status === "ACCEPTED";
    
    return (
        <Html>
            <Head />
            <Preview>
                {isAccepted 
                    ? `🎉 Your application for ${gigTitle} was accepted!` 
                    : `Update on your application for ${gigTitle}`}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>
                        {isAccepted ? "Application Accepted!" : "Application Status Update"}
                    </Heading>
                    <Text style={text}>
                        Hi {applicantName},
                    </Text>
                    <Text style={text}>
                        {isAccepted 
                            ? `Great news! The founder has accepted your application for ` 
                            : `The founder has reviewed your application for `}
                        <strong>{gigTitle}</strong>.
                    </Text>
                    
                    {!isAccepted && (
                        <Text style={text}>
                            Unfortunately, they decided to move forward with other candidates at this time. Don&apos;t be discouraged! There are many other opportunities waiting for you.
                        </Text>
                    )}
                    
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={`${baseUrl}/dashboard/student/applications`}
                        >
                            {isAccepted ? "View Next Steps" : "Find Other Gigs"}
                        </Button>
                    </Section>
                    
                    <Text style={footer}>
                        Best,<br />
                        The CampusConnect Team
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ApplicationStatusEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    paddingTop: "32px",
    paddingBottom: "16px",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
};

const buttonContainer = {
    padding: "24px 0",
};

const button = {
    backgroundColor: "#7C3AED",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "14px 24px",
};

const footer = {
    color: "#898989",
    fontSize: "14px",
    lineHeight: "22px",
    marginTop: "24px",
};
