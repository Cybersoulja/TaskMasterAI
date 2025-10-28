# Mastra Agent Template

This is a template for building AI agents and workflows using [Mastra](https://mastra.io/). It comes with a set of pre-built tools and workflows that can be used as a starting point for your own projects.

## Getting Started

To get started, you'll need to have a [Replit](https://replit.com/) account and have the [Mastra CLI](https://mastra.io/docs/cli) installed.

1. **Fork this Repl.**
2. **Install the dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```

This will start the Mastra development server on `http://localhost:3000`.

## Available Tools

This template comes with the following tools:

* **`emailTool`**: Sends an email to a specified recipient.
* **`exampleTool`**: A simple example tool that demonstrates how to create a Mastra tool.
* **`summarizeTool`**: Generates a summary of text using an AI model.
* **`wakatimeTool`**: Fetches coding activity statistics from the WakaTime API.

## Available Workflows

This template comes with the following workflows:

* **`exampleWorkflow`**: An example workflow that demonstrates how to chain multiple steps together.
* **`weeklySummaryWorkflow`**: A workflow that automates the process of sending a weekly coding summary email.

## Available Triggers

This template comes with the following triggers:

* **`slackTriggers`**: A trigger that listens for messages in a Slack channel.
* **`telegramTriggers`**: A trigger that listens for messages in a Telegram chat.
