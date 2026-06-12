import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { LinerClient } from "liner-convex";

const liner = new LinerClient(components.liner);

function userMessage(question: string) {
  return [{ role: "user" as const, content: question }];
}

export const searchWeb = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await liner.searchWeb(ctx, {
      query: args.query,
      limit: args.limit,
    });
  },
});

export const searchScholar = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await liner.searchScholar(ctx, {
      query: args.query,
      limit: args.limit,
    });
  },
});

export const quickAnswerAgent = action({
  args: {
    question: v.string(),
  },
  handler: async (ctx, args) => {
    return await liner.quickAnswerAgent(ctx, {
      messages: userMessage(args.question),
    });
  },
});

export const searchAgent = action({
  args: {
    question: v.string(),
  },
  handler: async (ctx, args) => {
    return await liner.searchAgent(ctx, {
      messages: userMessage(args.question),
    });
  },
});

export const deepResearchAgent = action({
  args: {
    question: v.string(),
  },
  handler: async (ctx, args) => {
    return await liner.deepResearchAgent(ctx, {
      messages: userMessage(args.question),
    });
  },
});
