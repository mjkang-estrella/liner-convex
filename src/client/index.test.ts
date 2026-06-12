import { describe, expect, test, vi } from "vitest";
import { LinerClient } from "./index.js";
import { components } from "./setup.test.js";

describe("LinerClient", () => {
  test("search methods delegate to the MCP search actions", async () => {
    const client = new LinerClient(components.liner);
    const runAction = vi.fn().mockResolvedValue({ results: [] });

    await client.searchWeb({ runAction }, { query: "recent ai regulation" });
    await client.searchScholar(
      { runAction },
      { query: "retrieval augmented generation", limit: 5 },
    );

    expect(runAction).toHaveBeenCalledWith(components.liner.lib.searchWeb, {
      query: "recent ai regulation",
    });
    expect(runAction).toHaveBeenCalledWith(components.liner.lib.searchScholar, {
      query: "retrieval augmented generation",
      limit: 5,
    });
  });

  test("agent methods delegate to the MCP agent actions", async () => {
    const client = new LinerClient(components.liner);
    const runAction = vi.fn().mockResolvedValue({ text: "" });
    const args = {
      messages: [{ role: "user" as const, content: "What is Convex?" }],
    };

    await client.quickAnswerAgent({ runAction }, args);
    await client.searchAgent({ runAction }, args);
    await client.deepResearchAgent({ runAction }, args);

    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.quickAnswerAgent,
      args,
    );
    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.searchAgent,
      args,
    );
    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.deepResearchAgent,
      args,
    );
  });
});
