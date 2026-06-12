# Liner Convex

Use Liner's OAuth-backed MCP tools from Convex actions.

This component calls Liner's remote Streamable HTTP MCP server from Convex and exposes the current Liner MCP tool surface:

- `search_web`
- `search_scholar`
- `quick_answer_agent`
- `search_agent`
- `deep_research_agent`

## Quick Start

### 1. Install the Component

```bash
npm install liner-convex
```

### 2. Configure Convex

Add the component to your `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import { v } from "convex/values";
import liner from "liner-convex/convex.config";

const app = defineApp({
  env: {
    LINER_MCP_ACCESS_TOKEN: v.string(),
  },
});

app.use(liner, {
  name: "liner",
  env: {
    LINER_MCP_ACCESS_TOKEN: app.env.LINER_MCP_ACCESS_TOKEN,
  },
});

export default app;
```

### 3. Set Up Environment Variables

Liner MCP now authenticates with OAuth. Store an OAuth access token that has the `mcp` scope in Convex environment configuration:

| Variable | Description |
| --- | --- |
| `LINER_MCP_ACCESS_TOKEN` | OAuth access token for Liner MCP with scope `mcp` |

You can set it from the CLI:

```bash
npx convex env set LINER_MCP_ACCESS_TOKEN <oauth-access-token>
```

Do not store a Liner API key here. Static API-key authentication is no longer supported for the Liner MCP server.

### 4. Use the Component

```typescript
import { action } from "./_generated/server";
import { components } from "./_generated/api";
import { LinerClient } from "liner-convex";

const liner = new LinerClient(components.liner);

export const searchNews = action({
  handler: async (ctx) => {
    return await liner.searchWeb(ctx, {
      query: "recent AI regulation updates",
      limit: 10,
    });
  },
});

export const answerWithSources = action({
  handler: async (ctx) => {
    return await liner.searchAgent(ctx, {
      messages: [
        {
          role: "user",
          content: "What are the latest developments in quantum computing?",
        },
      ],
    });
  },
});

export const researchBrief = action({
  handler: async (ctx) => {
    return await liner.deepResearchAgent(ctx, {
      messages: [
        {
          role: "user",
          content: "Compare recent frontier AI model launches.",
        },
      ],
    });
  },
});
```

## API Reference

### `searchWeb(ctx, args)`

Call Liner MCP tool `search_web` for structured web results.

```typescript
await liner.searchWeb(ctx, {
  query: "recent AI regulation updates",
  limit: 10,
});
```

Parameters:

- `query` - Search query string.
- `limit` - Optional maximum result count.

### `searchScholar(ctx, args)`

Call Liner MCP tool `search_scholar` for academic results.

```typescript
await liner.searchScholar(ctx, {
  query: "retrieval augmented generation evaluation",
  limit: 5,
});
```

### `quickAnswerAgent(ctx, args)`

Call Liner MCP tool `quick_answer_agent` for a short source-backed factual answer.

```typescript
await liner.quickAnswerAgent(ctx, {
  messages: [{ role: "user", content: "What is the capital of France?" }],
});
```

### `searchAgent(ctx, args)`

Call Liner MCP tool `search_agent` for a source-backed synthesized answer with citations.

```typescript
await liner.searchAgent(ctx, {
  messages: [{ role: "user", content: "Summarize today's chip export news." }],
});
```

### `deepResearchAgent(ctx, args)`

Call Liner MCP tool `deep_research_agent` for multi-step citation-rich research.

```typescript
await liner.deepResearchAgent(ctx, {
  messages: [
    {
      role: "user",
      content: "Compare the effectiveness of mRNA vs protein subunit vaccines.",
    },
  ],
});
```

## MCP Result Normalization

The component sends JSON-RPC `tools/call` requests to:

```text
https://platform.liner.com/api/v1/mcp
```

MCP text content is parsed as JSON when possible. Search results are returned with both original MCP fields and normalized `request_id` / `total_count` aliases. Agent event arrays are aggregated into:

```typescript
{
  answer: string;
  text: string;
  message_id?: unknown;
  request_id?: unknown;
  trace_id?: unknown;
  references: unknown[];
  events: unknown[];
}
```

## Requirements

- Liner account with OAuth access to MCP
- OAuth access token with `mcp` scope
- Convex 1.39.1 or later

## How It Works

This component wraps Liner MCP calls inside a Convex component. Your actions call `LinerClient`, which runs component actions that:

1. Read `LINER_MCP_ACCESS_TOKEN` from component environment configuration.
2. Call Liner's MCP `tools/call` method over Streamable HTTP.
3. Normalize MCP tool text content into JavaScript objects.
4. Return results to the calling action.

The OAuth access token stays in Convex env, not in client-visible code.

## Development

```bash
npm install
npm run build
npm test
npm run typecheck
npm run lint
```

Work against a live deployment with the example app:

```bash
npm run dev
```

See [example/README.md](./example/README.md) for a walkthrough.
