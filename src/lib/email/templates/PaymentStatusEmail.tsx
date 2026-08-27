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

interface PaymentStatusEmailProps {
    recipientName: string;
    gigTitle: string;
    amount: number;
    status: "FUNDED" | "RELEASED";
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

export const PaymentStatusEmail = ({ 
    recipientName, 
    gigTitle,
    amount,
    status
}: PaymentStatusEmailProps) => {
    const isFunded = status === "FUNDED";
    
    return (
        <Html>
            <Head />
            <Preview>
                {isFunded 
                    ? `Payment secured in escrow for ${gigTitle}` 
                    : `Payment released for ${gigTitle}`}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>
                        {isFunded ? "Escrow Funded" : "Payment Released!"}
                    </Heading>
                    <Text style={text}>
                        Hi {recipientName},
                    </Text>
                    
                    <Text style={text}>
                        {isFunded 
                            ? `The amount of ₹${amount} has been successfully secured in escrow for the gig ` 
                            : `The amount of ₹${amount} has been successfully released from escrow for the gig `}
                        <strong>{gigTitle}</strong>.
                    </Text>
                    
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={`${baseUrl}/dashboard`}
                        >
                            View Transaction
                        </Button>
                    </Section>
                    
                    <Text style={text}>
                        If you have any questions, please contact our support team.
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

export default PaymentStatusEmail;

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
