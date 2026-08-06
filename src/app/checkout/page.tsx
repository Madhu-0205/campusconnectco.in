import { headers } from "next/headers";
import { Suspense } from "react";

import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutClient nonce={nonce} />
    </Suspense>
  );
}
