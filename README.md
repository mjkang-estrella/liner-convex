# Liner Convex

Use Liner's search, quick answer, AI Search, and Deep Research APIs from Convex actions with your API key kept in Convex env.

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
    LINER_API_KEY: v.string(),
  },
});

app.use(liner, {
  name: "liner",
  env: {
    LINER_API_KEY: app.env.LINER_API_KEY,
  },
});

export default app;
```

### 3. Set Up Environment Variables

Add this to your Convex Dashboard -> Settings -> Environment Variables:

| Variable | Description |
| --- | --- |
| `LINER_API_KEY` | Your Liner API key |

You can also set it from the CLI:

```bash
npx convex env set LINER_API_KEY <your-key>
```

### 4. Use the Component

```typescript
import { action } from "./_generated/server";
import { components } from "./_generated/api";
import { LinerClient } from "liner-convex";

const liner = new LinerClient(components.liner);

export const searchNews = action({
  handler: async (ctx) => {
    return await liner.webSearch(ctx, {
      query: "recent AI regulation updates",
      country_code: "us",
      lang: "en",
      date_range: "past_week",
      max_results: 10,
    });
  },
});

export const answerWithSources = action({
  handler: async (ctx) => {
    return await liner.aiSearch(ctx, {
      messages: [
        {
          role: "user",
          content: "What are the latest developments in quantum computing?",
        },
      ],
      mode: "general",
    });
  },
});

export const researchBrief = action({
  handler: async (ctx) => {
    return await liner.deepResearchPro(ctx, {
      messages: [
        {
          role: "user",
          content: "Compare recent frontier AI model launches.",
        },
      ],
      lang: "en",
    });
  },
});
```

## API Reference

### `webSearch(ctx, args)`

Call Liner Web Search (`/v1/search/web`) for structured web results.

```typescript
await liner.webSearch(ctx, {
  query: "recent AI regulation updates",
  country_code: "us",
  lang: "en",
  date_range: "past_week",
  max_results: 10,
});
```

Parameters:

- `query` - Search query string.
- `country_code` - Optional ISO 3166-1 alpha-2 country code.
- `lang` - Optional language code such as `en`, `ko`, or `ja`.
- `date_range` - Optional `past_day`, `past_week`, `past_month`, or `past_year`.
- `max_results` - Optional result count, up to 20.
- `request_id` - Optional client-supplied ID echoed by Liner.

### `scholarSearch(ctx, args)`

Call Liner Scholar Search (`/v1/search/scholar`) for academic results.

```typescript
await liner.scholarSearch(ctx, {
  query: "retrieval augmented generation evaluation",
  lang: "en",
  max_results: 5,
});
```

Scholar results can include academic metadata such as `citation_count`, `authors`, and `journal`.

### `quickAnswer(ctx, args)`

Call Liner Quick Answer (`/v1/quick-answer`) for a short streamed answer with citations.

```typescript
await liner.quickAnswer(ctx, {
  messages: [{ role: "user", content: "What is the capital of France?" }],
});
```

### `aiSearch(ctx, args)` and `aiSearchPro(ctx, args)`

Call Liner AI Search (`/v1/ai-search`) or AI Search Pro (`/v1/ai-search-pro`) for grounded answers with sources.

```typescript
await liner.aiSearch(ctx, {
  messages: [{ role: "user", content: "Summarize today's chip export news." }],
  lang: "en",
  mode: "general",
});
```

Parameters:

- `messages` - Conversation history. The final message must be a user message.
- `model` - Optional model identifier. `null` selects Liner's default.
- `lang` - Optional language code.
- `mode` - Optional `general` or `scholar`.
- `request_id` - Optional client-supplied ID echoed by Liner.
- `include_events` - Optional boolean. When true, the aggregate response includes `raw_events`.

### `deepResearch(ctx, args)` and `deepResearchPro(ctx, args)`

Call Liner Deep Research (`/v1/deep-research`) or Deep Research Pro (`/v1/deep-research-pro`) for long-form citation-rich reports.

```typescript
await liner.deepResearch(ctx, {
  messages: [
    {
      role: "user",
      content: "Compare the effectiveness of mRNA vs protein subunit vaccines.",
    },
  ],
  lang: "en",
});
```

## SSE Aggregation

Liner's Quick Answer, AI Search, and Deep Research APIs stream Server-Sent Events. This component parses the stream inside a Convex action and returns:

```typescript
{
  text: string;
  reasoning: string;
  references: unknown[];
  referenceChunks: unknown[];
  tasks: unknown[];
  searchSteps: unknown[];
  metadata?: unknown;
  message_id?: string;
  event_counts: Record<string, number>;
  raw_events?: unknown[];
}
```

Use `include_events: true` when debugging or when you need direct access to Liner's raw SSE envelopes.

## Requirements

- Liner account and API key
- Convex 1.39.1 or later

## How It Works

This component wraps Liner API calls inside a Convex component. Your actions call `LinerClient`, which runs component actions that:

1. Read `LINER_API_KEY` from component environment configuration.
2. Call Liner JSON or SSE endpoints with your arguments.
3. Parse streaming responses into typed aggregate results.
4. Return results to your Convex action.

The API key stays in Convex env, not in client-visible code.

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
