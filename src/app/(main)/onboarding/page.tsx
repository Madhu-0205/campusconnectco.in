import { Suspense } from "react";

import OnboardingClient from "./OnboardingClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingClient />
    </Suspense>
  );
}
