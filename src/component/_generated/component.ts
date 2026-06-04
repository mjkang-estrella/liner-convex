/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

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

type SearchResult = {
  title: string;
  url: string;
  hostname?: string;
  favicon_url?: string | null;
  description?: string;
  date?: string | null;
  citation_count?: number;
  authors?: Array<string>;
  journal?: string;
};

type SearchResponse = {
  request_id?: string;
  results: Array<SearchResult>;
  total_count?: number;
};

type SseArgs = {
  messages: Array<Message>;
  request_id?: string;
  include_events?: boolean;
};

type AiSearchArgs = SseArgs & {
  model?: string | null;
  lang?: string;
  mode?: "general" | "scholar";
};

type DeepResearchArgs = SseArgs & {
  lang?: string;
};

type SseResponse = {
  text: string;
  reasoning: string;
  references: Array<any>;
  referenceChunks: Array<any>;
  tasks: Array<any>;
  searchSteps: Array<any>;
  metadata?: any;
  message_id?: string;
  event_counts: any;
  raw_events?: Array<any>;
};

/**
 * A utility for referencing a Convex component's exposed API.
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      aiSearch: FunctionReference<
        "action",
        "internal",
        AiSearchArgs,
        SseResponse,
        Name
      >;
      aiSearchPro: FunctionReference<
        "action",
        "internal",
        AiSearchArgs,
        SseResponse,
        Name
      >;
      deepResearch: FunctionReference<
        "action",
        "internal",
        DeepResearchArgs,
        SseResponse,
        Name
      >;
      deepResearchPro: FunctionReference<
        "action",
        "internal",
        DeepResearchArgs,
        SseResponse,
        Name
      >;
      quickAnswer: FunctionReference<
        "action",
        "internal",
        SseArgs,
        SseResponse,
        Name
      >;
      scholarSearch: FunctionReference<
        "action",
        "internal",
        ScholarSearchArgs,
        SearchResponse,
        Name
      >;
      webSearch: FunctionReference<
        "action",
        "internal",
        WebSearchArgs,
        SearchResponse,
        Name
      >;
    };
  };

