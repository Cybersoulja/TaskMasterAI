import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface WakaTimeData {
  data: Array<{
    grand_total: {
      text: string;
      total_seconds: number;
      hours: number;
      minutes: number;
    };
    projects: Array<{
      name: string;
      text: string;
      percent: number;
    }>;
    languages: Array<{
      name: string;
      text: string;
      percent: number;
    }>;
    editors: Array<{
      name: string;
      text: string;
      percent: number;
    }>;
    range: {
      date: string;
      text: string;
    };
  }>;
}

const generateSummary = async ({
  wakaTimeData,
  logger,
}: {
  wakaTimeData: WakaTimeData;
  logger?: IMastraLogger;
}) => {
  logger?.info("🔧 [Summarize] Starting AI summary generation");

  if (!wakaTimeData.data || wakaTimeData.data.length === 0) {
    logger?.warn("⚠️ [Summarize] No WakaTime data provided");
    return "No coding activity found for the specified period.";
  }

  // Calculate totals
  const totalSeconds = wakaTimeData.data.reduce(
    (sum, day) => sum + day.grand_total.total_seconds,
    0
  );
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  // Aggregate projects
  const projectsMap = new Map<string, number>();
  wakaTimeData.data.forEach((day) => {
    day.projects.forEach((project) => {
      projectsMap.set(
        project.name,
        (projectsMap.get(project.name) || 0) + project.percent
      );
    });
  });

  // Aggregate languages
  const languagesMap = new Map<string, number>();
  wakaTimeData.data.forEach((day) => {
    day.languages.forEach((language) => {
      languagesMap.set(
        language.name,
        (languagesMap.get(language.name) || 0) + language.percent
      );
    });
  });

  // Get date range
  const startDate = wakaTimeData.data[0]?.range.date || "N/A";
  const endDate =
    wakaTimeData.data[wakaTimeData.data.length - 1]?.range.date || "N/A";

  // Sort and get top items
  const topProjects = Array.from(projectsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, percent]) => `${name} (${(percent / wakaTimeData.data.length).toFixed(1)}%)`);

  const topLanguages = Array.from(languagesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, percent]) => `${name} (${(percent / wakaTimeData.data.length).toFixed(1)}%)`);

  const prompt = `Create a friendly and engaging weekly coding summary report based on the following data:

Period: ${startDate} to ${endDate}
Total Coding Time: ${totalHours} hours ${totalMinutes} minutes
Number of Days with Activity: ${wakaTimeData.data.length}

Top Projects:
${topProjects.join("\n")}

Top Languages:
${topLanguages.join("\n")}

Please create a summary that:
1. Starts with a warm greeting and overview of the week
2. Highlights the total coding time and average per day
3. Mentions the top projects worked on
4. Notes the main programming languages used
5. Ends with an encouraging message

Make it conversational and motivating, as if you're a supportive coding buddy reviewing the week together.`;

  logger?.info("📝 [Summarize] Calling AI to generate summary");

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    logger?.info("✅ [Summarize] AI summary generated successfully");
    return text;
  } catch (error) {
    logger?.error("❌ [Summarize] Error generating AI summary", { error });
    throw error;
  }
};

export const summarizeTool = createTool({
  id: "generate-wakatime-summary",
  description: `Generates a friendly, engaging summary of coding activity from WakaTime data using AI. Takes raw WakaTime statistics and creates a human-readable weekly report.`,
  inputSchema: z.object({
    wakaTimeData: z.object({
      data: z.array(
        z.object({
          grand_total: z.object({
            text: z.string(),
            total_seconds: z.number(),
            hours: z.number(),
            minutes: z.number(),
          }),
          projects: z.array(
            z.object({
              name: z.string(),
              text: z.string(),
              percent: z.number(),
            })
          ),
          languages: z.array(
            z.object({
              name: z.string(),
              text: z.string(),
              percent: z.number(),
            })
          ),
          editors: z.array(
            z.object({
              name: z.string(),
              text: z.string(),
              percent: z.number(),
            })
          ),
          range: z.object({
            date: z.string(),
            text: z.string(),
          }),
        })
      ),
    }),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ context: { wakaTimeData }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔧 [Summarize Tool] Starting execution");

    const summary = await generateSummary({ wakaTimeData, logger });

    logger?.info("✅ [Summarize Tool] Completed successfully");

    return { summary };
  },
});
