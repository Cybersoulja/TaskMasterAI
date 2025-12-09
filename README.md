# Taskmaster AI

**Taskmaster AI** is a workflow automation system built with the [Mastra](https://mastra.ai) TypeScript agent framework. The application orchestrates AI-powered agents, tools, and workflows to automate tasks like fetching coding statistics from WakaTime, generating summaries using LLMs, and sending email reports. It leverages Inngest for workflow execution and supports both development and production environments with integrated observability and real-time monitoring.

## System Architecture

### Framework and Core Technologies

- **Mastra Framework**: Built on Mastra v0.20.0, providing primitives for agents, workflows, tools, and memory.
- **Runtime Environment**: Node.js 20.9.0+ with ES2022 modules and strict TypeScript.
- **LLM Integration**: Vercel AI SDK for model routing (OpenAI, OpenRouter).

### Agent Architecture

- **Agent System**: Agents combine LLM models, system instructions, tools, and memory.
- **Runtime Context**: Dynamic behavior injection via `RuntimeContext`.

### Workflow System

- **Workflow Orchestration**: Graph-based engine integrated with Inngest.
- **Step Pattern**: Typed steps with Zod validation.
- **Inngest Integration**: Automatic registration of workflows as Inngest functions.

### Tool Architecture

- **Tool System**: Reusable, typed functions with Zod schema validation.
- **Examples**: WakaTime integration, LLM summarization, Email delivery.

### Storage and Memory

- **PostgreSQL**: Primary storage for workflow state and logs.
- **LibSQL**: Alternative lightweight storage.
- **Memory System**: Persists conversation history and user preferences.

### Logging and Observability

- **Logger**: JSON-formatted structured logging via Pino.
- **Development Tools**: Mastra Dev Server for testing and debugging.

## Next Steps

- **Testing**: Implement unit and integration tests (e.g., using Vitest or Jest).
- **Integrations**: Configure Notion, Slack, and Jira integrations.
- **Deployment**: Set up production deployment pipelines.
- **Observability**: Integrate with external providers like OpenTelemetry.
- **User Interface**: Develop a frontend interface (e.g., Next.js).
