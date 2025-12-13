import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";

/**
 * The Inngest client instance for the application.
 * This client is configured to use different settings for production and development environments.
 * In development, it connects to a local Inngest server and uses the realtime middleware for debugging.
 * In production, it uses the production configuration.
 *
 * @see https://www.inngest.com/docs
 */
export const inngest = new Inngest(
  process.env.NODE_ENV === "production"
    ? {
        id: "replit-agent-workflow",
        name: "Replit Agent Workflow System",
      }
    : {
        id: "mastra",
        baseUrl: "http://localhost:3000",
        isDev: true,
        middleware: [realtimeMiddleware()],
      },
);
