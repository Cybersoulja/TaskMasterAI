import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

interface WakaTimeSummary {
  data: Array<{
    grand_total: {
      digital: string;
      hours: number;
      minutes: number;
      text: string;
      total_seconds: number;
    };
    projects: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    languages: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    editors: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    operating_systems: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    categories: Array<{
      name: string;
      total_seconds: number;
      percent: number;
      digital: string;
      text: string;
      hours: number;
      minutes: number;
    }>;
    range: {
      start: string;
      end: string;
      date: string;
      text: string;
      timezone: string;
    };
  }>;
}

const fetchWakaTimeStats = async ({
  startDate,
  endDate,
  logger,
}: {
  startDate: string;
  endDate: string;
  logger?: IMastraLogger;
}) => {
  const apiKey = process.env.WAKATIME_API_KEY;
  
  if (!apiKey) {
    throw new Error("WAKATIME_API_KEY environment variable is not set");
  }

  logger?.info("🔧 [WakaTime] Fetching stats", { startDate, endDate });

  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${startDate}&end=${endDate}`;
  
  const base64ApiKey = Buffer.from(apiKey).toString("base64");
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${base64ApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger?.error("❌ [WakaTime] API request failed", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `WakaTime API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as WakaTimeSummary;
    logger?.info("✅ [WakaTime] Successfully fetched stats", {
      daysCount: data.data.length,
    });

    return data;
  } catch (error) {
    logger?.error("❌ [WakaTime] Error fetching stats", { error });
    throw error;
  }
};

export const wakatimeTool = createTool({
  id: "get-wakatime-stats",
  description: `Fetches coding activity statistics from WakaTime for a specified date range. Returns detailed information about coding time, projects, languages, editors, and more.`,
  inputSchema: z.object({
    startDate: z
      .string()
      .describe("Start date in YYYY-MM-DD format (e.g., '2024-01-01')"),
    endDate: z
      .string()
      .describe("End date in YYYY-MM-DD format (e.g., '2024-01-07')"),
  }),
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
  execute: async ({ context: { startDate, endDate }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔧 [WakaTime Tool] Starting execution", {
      startDate,
      endDate,
    });

    const result = await fetchWakaTimeStats({ startDate, endDate, logger });

    logger?.info("✅ [WakaTime Tool] Completed successfully", {
      daysCount: result.data.length,
    });

    return result;
  },
});
