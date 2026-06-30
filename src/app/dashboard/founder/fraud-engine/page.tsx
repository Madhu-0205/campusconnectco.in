import FraudEngineClient from "./FraudEngineClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Fraud Engine | Sentinel",
    description: "Neural network backed anomaly detection and risk scoring.",
}

export default function FraudEnginePage() {
    return <FraudEngineClient />
}
