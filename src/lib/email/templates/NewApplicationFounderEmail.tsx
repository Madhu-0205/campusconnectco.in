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

interface NewApplicationFounderEmailProps {
    founderName: string;
    applicantName: string;
    gigTitle: string;
    applicationId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

export const NewApplicationFounderEmail = ({ 
    founderName,
    applicantName, 
    gigTitle
}: NewApplicationFounderEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>New application received for {gigTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>New Application Received</Heading>
                    <Text style={text}>
                        Hi {founderName},
                    </Text>
                    <Text style={text}>
                        <strong>{applicantName}</strong> has just applied to your opportunity: <strong>{gigTitle}</strong>.
                    </Text>
                    
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={`${baseUrl}/dashboard/founder`}
                        >
                            Review Application
                        </Button>
                    </Section>
                    
                    <Text style={text}>
                        Log in to CampusConnect to review their profile, cover letter, and decide on the next steps.
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

export default NewApplicationFounderEmail;

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
