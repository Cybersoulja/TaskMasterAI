import { createWorkflow, createStep } from "../inngest";
import { z } from "zod";
import { RuntimeContext } from "@mastra/core/di";
import { wakatimeTool } from "../tools/wakatimeTool";
import { summarizeTool } from "../tools/summarizeTool";
import { emailTool } from "../tools/emailTool";

const runtimeContext = new RuntimeContext();

const fetchWakaTimeStatsStep = createStep({
  id: "fetch-wakatime-stats",
  description: "Fetches coding statistics from WakaTime for the past 7 days",
  inputSchema: z.object({}),
  outputSchema: z.object({
    data: z.array(
      z.object({
        grand_total: z.object({
          digital: z.string(),
          hours: z.number(),
          minutes: z.number(),
          text: z.string(),
          total_seconds: z.number(),
        }),
        projects: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        languages: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        editors: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        operating_systems: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        categories: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        range: z.object({
          start: z.string(),
          end: z.string(),
          date: z.string(),
          text: z.string(),
          timezone: z.string(),
        }),
      })
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📊 [Step 1] Fetching WakaTime stats for the past 7 days");

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const endDate = today.toISOString().split("T")[0];
    const startDate = sevenDaysAgo.toISOString().split("T")[0];

    logger?.info("📅 [Step 1] Date range", { startDate, endDate });

    const wakaTimeData = await wakatimeTool.execute({
      context: { startDate, endDate },
      runtimeContext,
    });

    logger?.info("✅ [Step 1] Successfully fetched WakaTime stats", {
      daysCount: wakaTimeData.data.length,
    });

    return wakaTimeData;
  },
});

const generateSummaryStep = createStep({
  id: "generate-summary",
  description: "Generates an AI-powered summary of the coding activity",
  inputSchema: z.object({
    data: z.array(
      z.object({
        grand_total: z.object({
          digital: z.string(),
          hours: z.number(),
          minutes: z.number(),
          text: z.string(),
          total_seconds: z.number(),
        }),
        projects: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        languages: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        editors: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        operating_systems: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        categories: z.array(
          z.object({
            name: z.string(),
            total_seconds: z.number(),
            percent: z.number(),
            digital: z.string(),
            text: z.string(),
            hours: z.number(),
            minutes: z.number(),
          })
        ),
        range: z.object({
          start: z.string(),
          end: z.string(),
          date: z.string(),
          text: z.string(),
          timezone: z.string(),
        }),
      })
    ),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🤖 [Step 2] Generating AI summary from WakaTime data");

    const result = await summarizeTool.execute({
      context: { wakaTimeData: inputData },
      runtimeContext,
    });

    logger?.info("✅ [Step 2] Successfully generated summary");

    return result;
  },
});

const sendEmailStep = createStep({
  id: "send-email",
  description: "Sends the weekly summary via email",
  inputSchema: z.object({
    summary: z.string(),
  }),
  outputSchema: z.object({
    accepted: z.array(z.string()),
    rejected: z.array(z.string()),
    messageId: z.string(),
    response: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📧 [Step 3] Sending weekly summary email");

    const recipientEmail = process.env.RECIPIENT_EMAIL;

    if (!recipientEmail) {
      throw new Error("RECIPIENT_EMAIL environment variable is not set");
    }

    const result = await emailTool.execute({
      context: {
        recipientEmail,
        subject: "Your Weekly Coding Summary 📊",
        content: inputData.summary,
      },
      runtimeContext,
    });

    logger?.info("✅ [Step 3] Successfully sent email", {
      messageId: result.messageId,
    });

    return result;
  },
});

export const weeklySummaryWorkflow = createWorkflow({
  id: "weekly-summary-workflow",
  description:
    "Fetches WakaTime coding statistics, generates an AI summary, and emails it to the user",
  inputSchema: z.object({}),
  outputSchema: z.object({
    accepted: z.array(z.string()),
    rejected: z.array(z.string()),
    messageId: z.string(),
    response: z.string(),
  }),
})
  .then(fetchWakaTimeStatsStep)
  .then(generateSummaryStep)
  .then(sendEmailStep)
  .commit();
