"use client";

import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default function Page(props: any) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingClient {...props} />
    </Suspense>
  );
}
