import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";
import { sendEmail, type SmtpMessage } from "../../utils/replitmail";

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
