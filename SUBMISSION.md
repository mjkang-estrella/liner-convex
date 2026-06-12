# Convex Components Directory Submission

Use these answers for https://www.convex.dev/components/submit.

| Field | Answer |
| --- | --- |
| Component Name | Liner |
| npm Package URL | https://www.npmjs.com/package/liner-convex |
| GitHub Repository URL | https://github.com/mjkang-estrella/liner-convex |
| Category | ai |
| Short Description | Use Liner's OAuth-backed MCP search and research tools from Convex actions with the access token kept in Convex env. |
| Demo URL / Example App | https://github.com/mjkang-estrella/liner-convex/tree/main/example |
| Tags | liner, ai, search, web-search, scholar-search, quick-answer, deep-research, retrieval, citations, rag |
| Optional Video URL | Leave blank. |
| Optional Logo/Thumbnail | Upload official Liner brand asset if available; otherwise leave blank. |

## Description

Liner Convex wraps Liner's OAuth-backed MCP tools as a reusable Convex Component. Convex actions can call web search, scholar search, Quick Answer Agent, Search Agent, and Deep Research Agent while keeping `LINER_MCP_ACCESS_TOKEN` in Convex environment configuration. MCP tool responses are normalized into JavaScript objects for use in Convex apps.

## Use Cases

Build source-backed chat and copilot answers, power RAG pipelines with fresh web or scholarly results, generate citation-rich research reports, and localize retrieval by language or country from Convex backend code.

## How It Works

Install the npm package, register the component in `convex/convex.config.ts`, pass `LINER_MCP_ACCESS_TOKEN` through Convex env, instantiate `LinerClient` with `components.liner`, and call its methods from Convex actions. The component performs server-side MCP `tools/call` requests to Liner, parses MCP text content, and returns normalized results to the calling action.

## Required Confirmations

- Check: I have read the FAQ.
- Check: The component meets the authoring guidelines.
- Check: I have permission to submit this component for others to use and share.
