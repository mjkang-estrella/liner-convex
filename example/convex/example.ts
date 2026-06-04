import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { LinerClient } from "@liner/convex-liner";

const liner = new LinerClient(components.liner);

const dateRangeValidator = v.union(
  v.literal("past_day"),
  v.literal("past_week"),
  v.literal("past_month"),
  v.literal("past_year"),
);

const aiSearchModeValidator = v.union(
  v.literal("general"),
  v.literal("scholar"),
);

function userMessage(question: string) {
  return [{ role: "user" as const, content: question }];
}

export const webSearch = action({
  args: {
    query: v.string(),
    country_code: v.optional(v.string()),
    lang: v.optional(v.string()),
    date_range: v.optional(dateRangeValidator),
    max_results: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await liner.webSearch(ctx, {
      query: args.query,
      country_code: args.country_code,
      lang: args.lang,
      date_range: args.date_range,
      max_results: args.max_results,
    });
  },
});

export const scholarSearch = action({
  args: {
    query: v.string(),
    lang: v.optional(v.string()),
    date_range: v.optional(dateRangeValidator),
    max_results: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await liner.scholarSearch(ctx, {
      query: args.query,
      lang: args.lang,
      date_range: args.date_range,
      max_results: args.max_results,
    });
  },
});

export const quickAnswer = action({
  args: {
    question: v.string(),
    include_events: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await liner.quickAnswer(ctx, {
      messages: userMessage(args.question),
      include_events: args.include_events,
    });
  },
});

export const aiSearch = action({
  args: {
    question: v.string(),
    model: v.optional(v.union(v.string(), v.null())),
    lang: v.optional(v.string()),
    mode: v.optional(aiSearchModeValidator),
    include_events: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await liner.aiSearch(ctx, {
      messages: userMessage(args.question),
      model: args.model,
      lang: args.lang,
      mode: args.mode,
      include_events: args.include_events,
    });
  },
});

export const aiSearchPro = action({
  args: {
    question: v.string(),
    model: v.optional(v.union(v.string(), v.null())),
    lang: v.optional(v.string()),
    mode: v.optional(aiSearchModeValidator),
    include_events: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await liner.aiSearchPro(ctx, {
      messages: userMessage(args.question),
      model: args.model,
      lang: args.lang,
      mode: args.mode,
      include_events: args.include_events,
    });
  },
});

export const deepResearch = action({
  args: {
    question: v.string(),
    lang: v.optional(v.string()),
    include_events: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await liner.deepResearch(ctx, {
      messages: userMessage(args.question),
      lang: args.lang,
      include_events: args.include_events,
    });
  },
});

export const deepResearchPro = action({
  args: {
    question: v.string(),
    lang: v.optional(v.string()),
    include_events: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await liner.deepResearchPro(ctx, {
      messages: userMessage(args.question),
      lang: args.lang,
      include_events: args.include_events,
    });
  },
});

