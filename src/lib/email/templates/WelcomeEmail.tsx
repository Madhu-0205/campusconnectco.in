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

interface WelcomeEmailProps {
    name: string;
    role: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

export const WelcomeEmail = ({ name, role }: WelcomeEmailProps) => {
    const isStudent = role === "STUDENT";
    
    return (
        <Html>
            <Head />
            <Preview>Welcome to CampusConnect! 🎉</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to CampusConnect, {name}! 🚀</Heading>
                    <Text style={text}>
                        {isStudent 
                            ? "We're thrilled to have you here. Your journey to finding the best gigs, internships, and opportunities starts now." 
                            : "We're thrilled to have you here. Ready to find top talent for your next big project?"}
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
                        If you have any questions or need help, just reply to this email. We&apos;re always here for you.
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

export default WelcomeEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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
