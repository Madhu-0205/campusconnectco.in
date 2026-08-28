import { Resend } from"resend";

import { logger } from"@/lib/logger";

const resendApiKey = process.env.RESEND_API_KEY;

// Check if API key exists and is not just a placeholder
const isResendConfigured = 
 !!resendApiKey && 
 !resendApiKey.includes("placeholder") && 
 resendApiKey.trim().length > 0;

export const resend = isResendConfigured ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM ||"notifications@campusconnectco.in";
export const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO ||"support@campusconnectco.in";

export type EmailSendOptions = {
 to: string | string[];
 subject: string;
 react: React.ReactElement;
 from?: string;
 replyTo?: string;
};

/**
 * Robust wrapper for sending transactional emails safely.
 * Returns true if sent (or mocked successfully), false on failure.
 * This avoids throwing errors and bringing down critical transaction paths.
 */
export async function sendTransactionalEmail(options: EmailSendOptions): Promise<boolean> {
 try {
 if (!isResendConfigured) {
 logger.info("[Email Mock] Email configuration missing or invalid. Mocking email send.", { 
 to: options.to, 
 subject: options.subject 
 });
 // Simulate network delay
 await new Promise(resolve => setTimeout(resolve, 300));
 return true;
 }

 const { data, error } = await resend!.emails.send({
 from: options.from || DEFAULT_FROM_EMAIL,
 replyTo: options.replyTo || DEFAULT_REPLY_TO,
 to: options.to,
 subject: options.subject,
 react: options.react,
 });

 if (error) {
 logger.error("[Email Error] Failed to send transactional email via Resend", error, {
 to: options.to,
 subject: options.subject,
 });
 return false;
 }

 logger.info("[Email Success] Transactional email sent successfully", {
 id: data?.id,
 to: options.to,
 subject: options.subject,
 });
 
 return true;
 } catch (error) {
 logger.error("[Email Exception] Unexpected error sending transactional email", error, {
 to: options.to,
 subject: options.subject,
 });
 // We gracefully fail here so business logic isn't interrupted by an email failure
 return false;
 }
}
