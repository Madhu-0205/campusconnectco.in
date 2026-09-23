import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryEvent } from "./src/lib/telemetry/sentry-privacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  environment: process.env.NODE_ENV || "development",
  
  tracesSampleRate: 0.1,
  
  beforeSend(event) {
    return sanitizeSentryEvent(event);
  },
});
