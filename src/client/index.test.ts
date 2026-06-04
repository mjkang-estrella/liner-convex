import { describe, expect, test, vi } from "vitest";
import { LinerClient } from "./index.js";
import { components } from "./setup.test.js";

describe("LinerClient", () => {
  test("webSearch delegates to the web search action", async () => {
    const client = new LinerClient(components.liner);
    const runAction = vi.fn().mockResolvedValue({ results: [] });

    await client.webSearch({ runAction }, { query: "recent ai regulation" });

    expect(runAction).toHaveBeenCalledWith(components.liner.lib.webSearch, {
      query: "recent ai regulation",
    });
  });

  test("scholarSearch delegates to the scholar search action", async () => {
    const client = new LinerClient(components.liner);
    const runAction = vi.fn().mockResolvedValue({ results: [] });

    await client.scholarSearch(
      { runAction },
      { query: "retrieval augmented generation", max_results: 5 },
    );

    expect(runAction).toHaveBeenCalledWith(components.liner.lib.scholarSearch, {
      query: "retrieval augmented generation",
      max_results: 5,
    });
  });

  test("answer methods delegate to their component actions", async () => {
    const client = new LinerClient(components.liner);
    const runAction = vi.fn().mockResolvedValue({ text: "", event_counts: {} });
    const args = {
      messages: [{ role: "user" as const, content: "What is Convex?" }],
    };

    await client.quickAnswer({ runAction }, args);
    await client.aiSearch({ runAction }, args);
    await client.aiSearchPro({ runAction }, args);
    await client.deepResearch({ runAction }, args);
    await client.deepResearchPro({ runAction }, args);

    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.quickAnswer,
      args,
    );
    expect(runAction).toHaveBeenCalledWith(components.liner.lib.aiSearch, args);
    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.aiSearchPro,
      args,
    );
    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.deepResearch,
      args,
    );
    expect(runAction).toHaveBeenCalledWith(
      components.liner.lib.deepResearchPro,
      args,
    );
  });
});

