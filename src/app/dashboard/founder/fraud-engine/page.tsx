import type { Metadata } from"next"

import FraudEngineClient from"./FraudEngineClient"

export const metadata: Metadata = {
 title:"Fraud Engine | Sentinel",
 description:"Neural network backed anomaly detection and risk scoring.",
}

export default function FraudEnginePage() {
 return <FraudEngineClient />
}
