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

type SearchArgs = {
  query: string;
  limit?: number;
};

type AgentArgs = {
  messages: Array<Message>;
};

/**
 * A utility for referencing a Convex component's exposed API.
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      deepResearchAgent: FunctionReference<
        "action",
        "internal",
        AgentArgs,
        any,
        Name
      >;
      quickAnswerAgent: FunctionReference<
        "action",
        "internal",
        AgentArgs,
        any,
        Name
      >;
      searchAgent: FunctionReference<
        "action",
        "internal",
        AgentArgs,
        any,
        Name
      >;
      searchScholar: FunctionReference<
        "action",
        "internal",
        SearchArgs,
        any,
        Name
      >;
      searchWeb: FunctionReference<"action", "internal", SearchArgs, any, Name>;
    };
  };
