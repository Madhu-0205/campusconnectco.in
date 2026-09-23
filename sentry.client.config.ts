import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "./src/lib/telemetry/sentry-privacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  environment: process.env.NODE_ENV || "development",

  integrations: [
    Sentry.replayIntegration({
      maskAllInputs: true,
      maskAllText: true,
      blockAllMedia: true,
      mask: ['input', 'textarea', 'select', '[contenteditable="true"]', '.mask-replay', '[data-sentry-mask]'],
      block: ['img', 'video', 'canvas', 'svg', '.block-replay'],
      networkDetailAllowUrls: [],
    }),
  ],

  tracesSampleRate: 0.1,
  // Session Replay strictly disabled by default (wiretapping / privacy compliance)
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,

  beforeBreadcrumb(breadcrumb) {
    return sanitizeSentryBreadcrumb(breadcrumb);
  },

  beforeSend(event) {
    return sanitizeSentryEvent(event);
  },
});
