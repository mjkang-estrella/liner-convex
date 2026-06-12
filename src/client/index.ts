import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export type MessageRole = "user" | "assistant";

export interface LinerMessage {
  role: MessageRole;
  content: string;
}

export interface SearchArgs {
  query: string;
  limit?: number;
}

export interface AgentArgs {
  messages: LinerMessage[];
}

export type LinerToolResponse = unknown;

export type ActionCtx = Pick<GenericActionCtx<GenericDataModel>, "runAction">;

export class LinerClient {
  constructor(private component: ComponentApi) {}

  async searchWeb(
    ctx: ActionCtx,
    args: SearchArgs,
  ): Promise<LinerToolResponse> {
    return await ctx.runAction(this.component.lib.searchWeb, args);
  }

  async searchScholar(
    ctx: ActionCtx,
    args: SearchArgs,
  ): Promise<LinerToolResponse> {
    return await ctx.runAction(this.component.lib.searchScholar, args);
  }

  async quickAnswerAgent(
    ctx: ActionCtx,
    args: AgentArgs,
  ): Promise<LinerToolResponse> {
    return await ctx.runAction(this.component.lib.quickAnswerAgent, args);
  }

  async searchAgent(
    ctx: ActionCtx,
    args: AgentArgs,
  ): Promise<LinerToolResponse> {
    return await ctx.runAction(this.component.lib.searchAgent, args);
  }

  async deepResearchAgent(
    ctx: ActionCtx,
    args: AgentArgs,
  ): Promise<LinerToolResponse> {
    return await ctx.runAction(this.component.lib.deepResearchAgent, args);
  }
}
