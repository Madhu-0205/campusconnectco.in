import { headers } from "next/headers";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return <CheckoutClient nonce={nonce} />;
}
