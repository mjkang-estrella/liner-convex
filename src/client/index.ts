import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export type MessageRole = "user" | "assistant";

export interface LinerMessage {
  role: MessageRole;
  content: string;
}

export type DateRange = "past_day" | "past_week" | "past_month" | "past_year";
export type AiSearchMode = "general" | "scholar";

export interface WebSearchArgs {
  query: string;
  country_code?: string;
  lang?: string;
  date_range?: DateRange;
  max_results?: number;
  request_id?: string;
}

export interface ScholarSearchArgs {
  query: string;
  lang?: string;
  date_range?: DateRange;
  max_results?: number;
  request_id?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  hostname?: string;
  favicon_url?: string | null;
  description?: string;
  date?: string | null;
  citation_count?: number;
  authors?: string[];
  journal?: string;
}

export interface SearchResponse {
  request_id?: string;
  results: SearchResult[];
  total_count?: number;
}

export interface SseArgs {
  messages: LinerMessage[];
  request_id?: string;
  include_events?: boolean;
}

export type QuickAnswerArgs = SseArgs;

export interface AiSearchArgs extends SseArgs {
  model?: string | null;
  lang?: string;
  mode?: AiSearchMode;
}

export interface DeepResearchArgs extends SseArgs {
  lang?: string;
}

export type LinerEventCounts = Record<string, number>;

export interface SseAggregateResponse {
  text: string;
  reasoning: string;
  references: unknown[];
  referenceChunks: unknown[];
  tasks: unknown[];
  searchSteps: unknown[];
  metadata?: unknown;
  message_id?: string;
  event_counts: LinerEventCounts;
  raw_events?: unknown[];
}

export type ActionCtx = Pick<GenericActionCtx<GenericDataModel>, "runAction">;

export class LinerClient {
  constructor(private component: ComponentApi) {}

  async webSearch(
    ctx: ActionCtx,
    args: WebSearchArgs,
  ): Promise<SearchResponse> {
    return await ctx.runAction(this.component.lib.webSearch, args);
  }

  async scholarSearch(
    ctx: ActionCtx,
    args: ScholarSearchArgs,
  ): Promise<SearchResponse> {
    return await ctx.runAction(this.component.lib.scholarSearch, args);
  }

  async quickAnswer(
    ctx: ActionCtx,
    args: QuickAnswerArgs,
  ): Promise<SseAggregateResponse> {
    return await ctx.runAction(this.component.lib.quickAnswer, args);
  }

  async aiSearch(
    ctx: ActionCtx,
    args: AiSearchArgs,
  ): Promise<SseAggregateResponse> {
    return await ctx.runAction(this.component.lib.aiSearch, args);
  }

  async aiSearchPro(
    ctx: ActionCtx,
    args: AiSearchArgs,
  ): Promise<SseAggregateResponse> {
    return await ctx.runAction(this.component.lib.aiSearchPro, args);
  }

  async deepResearch(
    ctx: ActionCtx,
    args: DeepResearchArgs,
  ): Promise<SseAggregateResponse> {
    return await ctx.runAction(this.component.lib.deepResearch, args);
  }

  async deepResearchPro(
    ctx: ActionCtx,
    args: DeepResearchArgs,
  ): Promise<SseAggregateResponse> {
    return await ctx.runAction(this.component.lib.deepResearchPro, args);
  }
}
