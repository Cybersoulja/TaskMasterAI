import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";
import { sendEmail, type SmtpMessage } from "../../utils/replitmail";

/**
 * Sends an email with the specified content.
 * @param {object} params - The parameters for sending the email.
 * @param {string} params.recipientEmail - The email address of the recipient.
 * @param {string} params.subject - The subject of the email.
 * @param {string} params.content - The plain text content of the email.
 * @param {IMastraLogger} [params.logger] - An optional logger instance.
 * @returns {Promise<object>} A promise that resolves with the result of the email sending operation.
 * @throws {Error} If the email fails to send.
 */
const sendSummaryEmail = async ({
  recipientEmail,
  subject,
  content,
  logger,
}: {
  recipientEmail: string;
  subject: string;
  content: string;
  logger?: IMastraLogger;
}) => {
  logger?.info("📧 [Email] Preparing to send email", {
    to: recipientEmail,
    subject,
  });

  try {
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      text: content,
    });

    logger?.info("✅ [Email] Email sent successfully", {
      accepted: result.accepted,
      messageId: result.messageId,
    });

    return result;
  } catch (error) {
    logger?.error("❌ [Email] Failed to send email", { error });
    throw error;
  }
};

/**
 * A Mastra tool for sending emails.
 * This tool can be used by agents and workflows to send emails with a specified recipient, subject, and content.
 *
 * @see https://mastra.io/docs/tools/overview
 */
export const emailTool = createTool({
  id: "send-email",
  description: `Sends an email to a recipient with a subject and content. Used for delivering reports, summaries, and notifications.`,
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Recipient email address"),
    subject: z.string().describe("Email subject line"),
    content: z.string().describe("Email body content (plain text)"),
  }),
  outputSchema: z.object({
    accepted: z.array(z.string()),
    rejected: z.array(z.string()),
    messageId: z.string(),
    response: z.string(),
  }),
  execute: async (
    { context: { recipientEmail, subject, content }, mastra }
  ) => {
    const logger = mastra?.getLogger();
    logger?.info("🔧 [Email Tool] Starting execution", {
      recipientEmail,
      subject,
    });

    const result = await sendSummaryEmail({
      recipientEmail,
      subject,
      content,
      logger,
    });

    logger?.info("✅ [Email Tool] Completed successfully", {
      messageId: result.messageId,
    });

    return result;
  },
});
