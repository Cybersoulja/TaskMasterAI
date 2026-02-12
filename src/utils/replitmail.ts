import { z } from "zod";

/**
 * Zod schema for an SMTP message.
 * This schema defines the structure of an email message, including recipients, subject, body, and attachments.
 * It is used to validate email messages before sending them.
 *
 * @see https://zod.dev/
 */
export const zSmtpMessage = z.object({
  to: z
    .union([z.string().email(), z.array(z.string().email())])
    .describe("Recipient email address(es)"),
  cc: z
    .union([z.string().email(), z.array(z.string().email())])
    .optional()
    .describe("CC recipient email address(es)"),
  subject: z.string().describe("Email subject"),
  text: z.string().optional().describe("Plain text body"),
  html: z.string().optional().describe("HTML body"),
  attachments: z
    .array(
      z.object({
        filename: z.string().describe("File name"),
        content: z.string().describe("Base64 encoded content"),
        contentType: z.string().optional().describe("MIME type"),
        encoding: z
          .enum(["base64", "7bit", "quoted-printable", "binary"])
          .default("base64"),
      }),
    )
    .optional()
    .describe("Email attachments"),
});

/**
 * Represents an SMTP message.
 * This type is inferred from the `zSmtpMessage` Zod schema.
 *
 * @see zSmtpMessage
 */
export type SmtpMessage = z.infer<typeof zSmtpMessage>;

/**
 * Retrieves the Replit authentication token from environment variables.
 * It checks for `REPL_IDENTITY` and `WEB_REPL_RENEWAL` to construct the token.
 *
 * @returns {string} The Replit authentication token.
 * @throws {Error} If no authentication token can be found.
 */
function getAuthToken(): string {
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error(
      "No authentication token found. Please set REPL_IDENTITY or ensure you're running in Replit environment.",
    );
  }

  return xReplitToken;
}

/**
 * Sends an email using the Replit Mailer API.
 * It takes an `SmtpMessage` object, retrieves the auth token, and makes a POST request to the mailer API.
 *
 * @param {SmtpMessage} message - The email message to send. The message must conform to the `zSmtpMessage` schema.
 * @returns {Promise<{accepted: string[], rejected: string[], pending?: string[], messageId: string, response: string}>} A promise that resolves with the response from the mailer API.
 * @throws {Error} If the email fails to send.
 */
export async function sendEmail(message: SmtpMessage): Promise<{
  accepted: string[];
  rejected: string[];
  pending?: string[];
  messageId: string;
  response: string;
}> {
  const authToken = getAuthToken();

  const response = await fetch(
    "https://connectors.replit.com/api/v2/mailer/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        X_REPLIT_TOKEN: authToken,
      },
      body: JSON.stringify({
        to: message.to,
        cc: message.cc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return await response.json();
}
