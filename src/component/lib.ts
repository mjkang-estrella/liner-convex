import { v, type Infer } from "convex/values";
import { action, env } from "./_generated/server.js";

const LINER_BASE_URL = "https://platform.liner.com/api/v1";

const dateRangeValidator = v.union(
  v.literal("past_day"),
  v.literal("past_week"),
  v.literal("past_month"),
  v.literal("past_year"),
);

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
});

const webSearchArgsValidator = {
  query: v.string(),
  country_code: v.optional(v.string()),
  lang: v.optional(v.string()),
  date_range: v.optional(dateRangeValidator),
  max_results: v.optional(v.number()),
  request_id: v.optional(v.string()),
};

const scholarSearchArgsValidator = {
  query: v.string(),
  lang: v.optional(v.string()),
  date_range: v.optional(dateRangeValidator),
  max_results: v.optional(v.number()),
  request_id: v.optional(v.string()),
};

const baseSseArgsValidator = {
  messages: v.array(messageValidator),
  request_id: v.optional(v.string()),
  include_events: v.optional(v.boolean()),
};

const aiSearchArgsValidator = {
  ...baseSseArgsValidator,
  model: v.optional(v.union(v.string(), v.null())),
  lang: v.optional(v.string()),
  mode: v.optional(v.union(v.literal("general"), v.literal("scholar"))),
};

const deepResearchArgsValidator = {
  ...baseSseArgsValidator,
  lang: v.optional(v.string()),
};

const searchResultValidator = v.object({
  title: v.string(),
  url: v.string(),
  hostname: v.optional(v.string()),
  favicon_url: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.string()),
  date: v.optional(v.union(v.string(), v.null())),
  citation_count: v.optional(v.number()),
  authors: v.optional(v.array(v.string())),
  journal: v.optional(v.string()),
});

const searchReturnValidator = v.object({
  request_id: v.optional(v.string()),
  results: v.array(searchResultValidator),
  total_count: v.optional(v.number()),
});

const sseReturnValidator = v.object({
  text: v.string(),
  reasoning: v.string(),
  references: v.array(v.any()),
  referenceChunks: v.array(v.any()),
  tasks: v.array(v.any()),
  searchSteps: v.array(v.any()),
  metadata: v.optional(v.any()),
  message_id: v.optional(v.string()),
  event_counts: v.any(),
  raw_events: v.optional(v.array(v.any())),
});

type SearchReturn = Infer<typeof searchReturnValidator>;
type SseReturn = Infer<typeof sseReturnValidator>;

type LinerEndpoint =
  | "/search/web"
  | "/search/scholar"
  | "/quick-answer"
  | "/ai-search"
  | "/ai-search-pro"
  | "/deep-research"
  | "/deep-research-pro";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type WebSearchArgs = {
  query: string;
  country_code?: string;
  lang?: string;
  date_range?: "past_day" | "past_week" | "past_month" | "past_year";
  max_results?: number;
  request_id?: string;
};

type ScholarSearchArgs = {
  query: string;
  lang?: string;
  date_range?: "past_day" | "past_week" | "past_month" | "past_year";
  max_results?: number;
  request_id?: string;
};

type BaseSseArgs = {
  messages: Message[];
  request_id?: string;
  include_events?: boolean;
};

type AiSearchArgs = BaseSseArgs & {
  model?: string | null;
  lang?: string;
  mode?: "general" | "scholar";
};

type DeepResearchArgs = BaseSseArgs & {
  lang?: string;
};

type RawSseEvent = Record<string, unknown> & {
  type?: string;
  data?: unknown;
  delta?: string;
  message_id?: string;
  message_metadata?: unknown;
};

type SseAggregate = {
  text: string;
  reasoning: string;
  references: unknown[];
  referenceChunks: unknown[];
  tasks: unknown[];
  searchSteps: unknown[];
  metadata?: unknown;
  message_id?: string;
  event_counts: Record<string, number>;
  raw_events?: RawSseEvent[];
};

function buildSearchBody(args: WebSearchArgs | ScholarSearchArgs) {
  return { ...args };
}

function buildSseBody<TArgs extends { include_events?: boolean }>(
  args: TArgs,
) {
  const { include_events: _includeEvents, ...body } = args;
  return body;
}

function buildJsonHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

function buildSseHeaders(apiKey: string) {
  return {
    ...buildJsonHeaders(apiKey),
    Accept: "text/event-stream",
  };
}

async function callLinerJson(
  endpoint: "/search/web" | "/search/scholar",
  body: unknown,
) {
  const response = await fetch(`${LINER_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: new Headers(buildJsonHeaders(getApiKey())),
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const parsed = text.length > 0 ? tryParseJson(text) : null;
  if (!response.ok) {
    throw new Error(
      `Liner ${endpoint} failed (${response.status}): ${extractErrorMessage(
        parsed,
        text,
        response.statusText,
      )}`.trim(),
    );
  }

  return parsed;
}

async function callLinerSse(
  endpoint:
    | "/quick-answer"
    | "/ai-search"
    | "/ai-search-pro"
    | "/deep-research"
    | "/deep-research-pro",
  args: { include_events?: boolean },
) {
  const response = await fetch(`${LINER_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: new Headers(buildSseHeaders(getApiKey())),
    body: JSON.stringify(buildSseBody(args)),
  });

  if (!response.ok) {
    const text = await response.text();
    const parsed = text.length > 0 ? tryParseJson(text) : null;
    throw new Error(
      `Liner ${endpoint} failed (${response.status}): ${extractErrorMessage(
        parsed,
        text,
        response.statusText,
      )}`.trim(),
    );
  }

  if (!response.body) {
    throw new Error(`Liner ${endpoint} returned an empty stream.`);
  }

  return await parseSseStream(response.body, endpoint, args.include_events);
}

async function parseSseStream(
  stream: ReadableStream<Uint8Array>,
  endpoint: LinerEndpoint,
  includeEvents = false,
): Promise<SseAggregate> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const state = createSseState(includeEvents);
  let buffer = "";
  let done = false;

  try {
    while (!done) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      buffer += decoder.decode(chunk.value, { stream: true });
      const processed = processBufferedLines(buffer, state, endpoint);
      buffer = processed.remainder;
      done = processed.done;
    }

    buffer += decoder.decode();
    if (buffer.length > 0 && !done) {
      const processed = processBufferedLines(`${buffer}\n`, state, endpoint);
      done = processed.done;
    }
  } finally {
    if (done) {
      await reader.cancel();
    } else {
      reader.releaseLock();
    }
  }

  return state;
}

async function parseSseText(
  text: string,
  endpoint: LinerEndpoint = "/ai-search",
  includeEvents = false,
) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return await parseSseStream(stream, endpoint, includeEvents);
}

function createSseState(includeEvents: boolean): SseAggregate {
  return {
    text: "",
    reasoning: "",
    references: [],
    referenceChunks: [],
    tasks: [],
    searchSteps: [],
    event_counts: {},
    ...(includeEvents ? { raw_events: [] } : {}),
  };
}

function processBufferedLines(
  buffer: string,
  state: SseAggregate,
  endpoint: LinerEndpoint,
) {
  let start = 0;
  let index = buffer.indexOf("\n", start);
  let done = false;

  while (index !== -1) {
    const line = buffer.slice(start, index).replace(/\r$/, "");
    if (processSseLine(line, state, endpoint)) {
      done = true;
      start = index + 1;
      break;
    }
    start = index + 1;
    index = buffer.indexOf("\n", start);
  }

  return {
    done,
    remainder: buffer.slice(start),
  };
}

function processSseLine(
  line: string,
  state: SseAggregate,
  endpoint: LinerEndpoint,
) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("event:")) {
    return false;
  }
  if (!trimmed.startsWith("data:")) {
    return false;
  }

  const payload = trimmed.slice("data:".length).trim();
  if (!payload) {
    return false;
  }
  if (payload === "[DONE]") {
    return true;
  }

  const event = tryParseJson(payload) as RawSseEvent;
  collectSseEvent(event, state, endpoint);
  return false;
}

function collectSseEvent(
  event: RawSseEvent,
  state: SseAggregate,
  endpoint: LinerEndpoint,
) {
  const eventType = event.type ?? "unknown";
  state.event_counts[eventType] = (state.event_counts[eventType] ?? 0) + 1;
  state.raw_events?.push(event);

  if (eventType === "data-error") {
    throw new Error(
      `Liner ${endpoint} stream error: ${extractErrorMessage(
        event,
        JSON.stringify(event),
        "stream error",
      )}`.trim(),
    );
  }

  switch (eventType) {
    case "start":
      if (typeof event.message_id === "string") {
        state.message_id = event.message_id;
      }
      if (event.message_metadata !== undefined) {
        state.metadata = event.message_metadata;
      }
      break;
    case "data-metadata":
      state.metadata = getEventData(event) ?? event;
      break;
    case "text-delta":
      if (typeof event.delta === "string") {
        state.text += event.delta;
      }
      break;
    case "reasoning-delta":
      if (typeof event.delta === "string") {
        state.reasoning += event.delta;
      }
      break;
    case "data-search-references":
      appendArray(state.references, getNestedArray(event, "references"));
      break;
    case "data-search-chunks":
      appendArray(state.referenceChunks, getNestedArray(event, "referenceChunks"));
      break;
    case "data-search-tasks":
      state.tasks = mergeTasks(state.tasks, getNestedArray(event, "tasks"));
      break;
    case "data-search-step":
      state.searchSteps.push(getEventData(event) ?? event);
      break;
  }
}

function getEventData(event: RawSseEvent) {
  if (
    event.data !== null &&
    typeof event.data === "object" &&
    event.data !== undefined
  ) {
    return event.data as Record<string, unknown>;
  }
  return undefined;
}

function getNestedArray(event: RawSseEvent, field: string) {
  const data = getEventData(event);
  const value = data?.[field];
  return Array.isArray(value) ? value : [];
}

function appendArray(target: unknown[], items: unknown[]) {
  target.push(...items);
}

function mergeTasks(existing: unknown[], updates: unknown[]) {
  if (updates.length === 0) {
    return existing;
  }
  const byId = new Map<string, unknown>();
  const withoutIds: unknown[] = [];

  for (const task of existing) {
    const id = taskId(task);
    if (id) {
      byId.set(id, task);
    } else {
      withoutIds.push(task);
    }
  }
  for (const task of updates) {
    const id = taskId(task);
    if (id) {
      byId.set(id, task);
    } else {
      withoutIds.push(task);
    }
  }

  return [...withoutIds, ...byId.values()];
}

function taskId(task: unknown) {
  if (task !== null && typeof task === "object" && "id" in task) {
    const value = (task as { id?: unknown }).id;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Liner returned a non-JSON response.");
  }
}

function extractErrorMessage(
  parsed: unknown,
  rawText: string,
  fallback: string,
) {
  if (parsed && typeof parsed === "object") {
    if ("message" in parsed && typeof parsed.message === "string") {
      return parsed.message;
    }
    if ("code" in parsed && "error" in parsed) {
      return `${String(parsed.code)}: ${String(parsed.error)}`;
    }
    if ("error" in parsed) {
      const error = parsed.error;
      if (typeof error === "string") {
        return error;
      }
      if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          return error.message;
        }
        if ("code" in error && typeof error.code === "string") {
          return error.code;
        }
      }
    }
  }
  return rawText.slice(0, 300) || fallback;
}

function getApiKey() {
  const apiKey = env.LINER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LINER_API_KEY for the Liner component.");
  }
  return apiKey;
}

export const webSearch = action({
  args: webSearchArgsValidator,
  returns: searchReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerJson(
      "/search/web",
      buildSearchBody(args as WebSearchArgs),
    )) as SearchReturn;
  },
});

export const scholarSearch = action({
  args: scholarSearchArgsValidator,
  returns: searchReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerJson(
      "/search/scholar",
      buildSearchBody(args as ScholarSearchArgs),
    )) as SearchReturn;
  },
});

export const quickAnswer = action({
  args: baseSseArgsValidator,
  returns: sseReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerSse("/quick-answer", args)) as SseReturn;
  },
});

export const aiSearch = action({
  args: aiSearchArgsValidator,
  returns: sseReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerSse("/ai-search", args as AiSearchArgs)) as SseReturn;
  },
});

export const aiSearchPro = action({
  args: aiSearchArgsValidator,
  returns: sseReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerSse(
      "/ai-search-pro",
      args as AiSearchArgs,
    )) as SseReturn;
  },
});

export const deepResearch = action({
  args: deepResearchArgsValidator,
  returns: sseReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerSse(
      "/deep-research",
      args as DeepResearchArgs,
    )) as SseReturn;
  },
});

export const deepResearchPro = action({
  args: deepResearchArgsValidator,
  returns: sseReturnValidator,
  handler: async (_ctx, args) => {
    return (await callLinerSse(
      "/deep-research-pro",
      args as DeepResearchArgs,
    )) as SseReturn;
  },
});

export const _test = {
  buildJsonHeaders,
  buildSearchBody,
  buildSseBody,
  buildSseHeaders,
  collectSseEvent,
  extractErrorMessage,
  parseSseText,
  tryParseJson,
};
