# Overview

This is **Taskmaster AI**, a workflow automation system built with the Mastra TypeScript agent framework. The application orchestrates AI-powered agents, tools, and workflows to automate tasks like fetching coding statistics from WakaTime, generating summaries using LLMs, and sending email reports. It leverages Inngest for workflow execution and supports both development and production environments with integrated observability and real-time monitoring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Framework and Core Technologies

**Mastra Framework**: The application is built on Mastra v0.20.0, an open-source TypeScript agent framework that provides primitives for building AI applications including agents, workflows, tools, and memory management.

**Runtime Environment**: Node.js 20.9.0+ with ES2022 modules, using TypeScript for type safety with strict mode enabled. The build system uses `tsx` for development and the Mastra CLI for production builds.

**LLM Integration**: Uses the Vercel AI SDK for model routing, supporting multiple providers including OpenAI (via `@ai-sdk/openai`) and OpenRouter (via `@openrouter/ai-sdk-provider`). The architecture allows for flexible model selection at the agent level.

## Agent Architecture

**Agent System**: Agents are defined using the `Agent` class from `@mastra/core/agent`. Each agent combines:
- An LLM model (e.g., OpenAI's GPT-4o-mini)
- System instructions defining behavior and personality
- Tools the agent can execute
- Optional memory storage using `@mastra/memory` with LibSQL backend

**Example Agent** (`exampleAgent`): Demonstrates the agent pattern with tool integration and memory persistence. Agents can be used standalone or composed within workflows.

**Runtime Context**: Implements dependency injection via `RuntimeContext` to provide runtime configuration to agents and tools, enabling dynamic behavior based on context (user preferences, environment variables, etc.).

## Workflow System

**Workflow Orchestration**: Workflows are built using Mastra's graph-based workflow engine with Inngest integration (`@mastra/inngest`). Workflows are composed of typed steps with Zod schema validation for inputs/outputs.

**Step Pattern**: Steps are discrete units of work created with `createStep()`, defining:
- Unique identifiers
- Input/output schemas (Zod)
- Resume/suspend schemas for pause/resume functionality
- Execute logic with access to Mastra context, step results, and runtime context

**Inngest Integration**: The `init()` function from `@mastra/inngest` wraps the Inngest client to create Mastra-compatible workflow helpers (`createWorkflow`, `createStep`, `cloneStep`). Workflows are automatically registered as Inngest functions with:
- Development mode: Local execution with real-time middleware
- Production mode: Distributed execution with retry logic (3 attempts)

**Example Workflows**:
- `exampleWorkflow`: Demonstrates agent-based workflow steps with sequential execution
- `weeklySummaryWorkflow`: Production workflow that fetches WakaTime stats, generates AI summaries, and sends email reports

## Tool Architecture

**Tool System**: Tools are reusable, typed functions created with `createTool()` that can be used by agents and workflows. Each tool defines:
- Unique identifier
- Description for LLM understanding
- Input/output schemas (Zod)
- Execute function with validated context

**Tool Examples**:
- `exampleTool`: Demonstrates basic tool pattern with data processing
- `wakatimeTool`: External API integration (WakaTime coding statistics)
- `summarizeTool`: LLM-powered text generation using Vercel AI SDK
- `emailTool`: Email delivery via Replit Mail integration

## Storage and Memory

**PostgreSQL Storage**: Primary storage backend using `@mastra/pg` (PostgresStore) for:
- Workflow state persistence (snapshots)
- Agent memory storage
- Execution history and logs

**LibSQL Integration**: Alternative storage option via `@mastra/libsql` for lightweight deployments.

**Memory System**: Agent memory implemented using `@mastra/memory` with configurable storage backends. Memory enables:
- Conversation history persistence
- User preference storage
- Context retrieval across sessions

## Logging and Observability

**Logger Implementation**: Custom `ProductionPinoLogger` extends `MastraLogger` using Pino for structured logging. Configuration includes:
- JSON-formatted logs with timestamps
- Configurable log levels (DEBUG, INFO, WARN, ERROR)
- Contextual metadata for debugging

**Error Handling**: Uses Mastra's `MastraError` and Inngest's `NonRetriableError` for granular error handling in workflows and agents.

**Development Tools**: Mastra Dev Server (`mastra dev`) provides:
- REST endpoints for agents, tools, and workflows
- Playground UI for testing and debugging
- Live reload during development
- SSE-based refresh events

## External Dependencies

**AI/LLM Services**:
- OpenAI API: Primary LLM provider for agents and summarization
- OpenRouter: Alternative LLM provider support
- Vercel AI SDK: Unified interface for model routing and streaming

**External APIs**:
- WakaTime API: Coding activity statistics
- Replit Mail: Email delivery service (SMTP via Replit authentication)

**Workflow Execution**:
- Inngest: Event-driven workflow execution platform with real-time monitoring (`@inngest/realtime`)
- Supports local development mode and production deployment

**Third-Party Integrations** (available but not actively used):
- Notion API (`@notionhq/client`)
- Slack Web API (`@slack/web-api`)
- Jira API (`jira.js`)
- Exa Search (`exa-js`)

**Database**:
- PostgreSQL: Primary storage for workflows, memory, and logs (via `@mastra/pg`)
- Connection string configurable via `DATABASE_URL` environment variable

**MCP (Model Context Protocol)**:
- `@mastra/mcp`: Integration layer for external tool servers following the Model Context Protocol specification

**Development Dependencies**:
- TypeScript 5.9.3+ with strict type checking
- Prettier for code formatting
- Mastra CLI (`mastra`) for build and development server