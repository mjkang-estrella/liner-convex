# Convex Components Directory Submission

Use these answers for https://www.convex.dev/components/submit.

| Field | Answer |
| --- | --- |
| Component Name | Liner |
| npm Package URL | https://www.npmjs.com/package/@liner/convex-liner |
| GitHub Repository URL | https://github.com/liner/convex-liner |
| Category | ai |
| Short Description | Use Liner's search, quick answer, AI Search, and Deep Research APIs from Convex actions with your API key kept in Convex env. |
| Demo URL / Example App | https://github.com/liner/convex-liner/tree/main/example |
| Tags | liner, ai, search, web-search, scholar-search, quick-answer, deep-research, retrieval, citations, rag |
| Optional Video URL | Leave blank. |
| Optional Logo/Thumbnail | Upload official Liner brand asset if available; otherwise leave blank. |

## Description

Liner Convex wraps Liner's AI-powered search APIs as a reusable Convex Component. Convex actions can call web search, scholar search, quick answers, AI Search, AI Search Pro, Deep Research, and Deep Research Pro while keeping LINER_API_KEY in Convex environment configuration. Streaming Liner endpoints are parsed into typed, citation-aware results for use in Convex apps.

## Use Cases

Build source-backed chat and copilot answers, power RAG pipelines with fresh web or scholarly results, generate citation-rich research reports, and localize retrieval by language or country from Convex backend code.

## How It Works

Install the npm package, register the component in `convex/convex.config.ts`, pass `LINER_API_KEY` through Convex env, instantiate `LinerClient` with `components.liner`, and call its methods from Convex actions. The component performs server-side HTTPS requests to Liner, parses JSON or SSE responses, and returns typed results to the calling action.

## Required Confirmations

- Check: I have read the FAQ.
- Check: The component meets the authoring guidelines.
- Check: I have permission to submit this component for others to use and share.

