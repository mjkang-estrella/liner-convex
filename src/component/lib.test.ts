import { describe, expect, test } from "vitest";
import { _test } from "./lib.js";

describe("component helpers", () => {
  test("search bodies keep Liner snake_case fields", () => {
    const body = _test.buildSearchBody({
      query: "recent AI regulation updates",
      country_code: "us",
      lang: "en",
      date_range: "past_week",
      max_results: 10,
      request_id: "req_123",
    });

    expect(body).toEqual({
      query: "recent AI regulation updates",
      country_code: "us",
      lang: "en",
      date_range: "past_week",
      max_results: 10,
      request_id: "req_123",
    });
  });

  test("sse bodies omit component-only include_events", () => {
    const body = _test.buildSseBody({
      messages: [{ role: "user", content: "What is Convex?" }],
      request_id: "req_123",
      include_events: true,
    });

    expect(body).toEqual({
      messages: [{ role: "user", content: "What is Convex?" }],
      request_id: "req_123",
    });
  });

  test("headers include Liner API authentication", () => {
    expect(_test.buildJsonHeaders("key_123")).toEqual({
      "Content-Type": "application/json",
      "x-api-key": "key_123",
    });
    expect(_test.buildSseHeaders("key_123")).toEqual({
      "Content-Type": "application/json",
      "x-api-key": "key_123",
      Accept: "text/event-stream",
    });
  });

  test("extracts error messages from common Liner error shapes", () => {
    expect(
      _test.extractErrorMessage(
        { error: { message: "Missing API key" } },
        "",
        "fallback",
      ),
    ).toBe("Missing API key");
    expect(
      _test.extractErrorMessage(
        { code: "RATE_LIMITED", error: "slow down" },
        "",
        "fallback",
      ),
    ).toBe("RATE_LIMITED: slow down");
  });

  test("parses SSE text and aggregates citations, tasks, reasoning, and text", async () => {
    const result = await _test.parseSseText(
      [
        'event: data',
        'data: {"type":"start","message_id":"msg_1","message_metadata":{"trace_id":"trace_1"}}',
        "",
        'event: data',
        'data: {"type":"data-search-references","data":{"references":[{"title":"Convex","url":"https://convex.dev"}]}}',
        "",
        'data: {"type":"data-search-chunks","data":{"referenceChunks":[{"num":1,"content":"Convex backend"}]}}',
        'data: {"type":"data-search-tasks","data":{"tasks":[{"id":"task_1","title":"Search","status":"in_progress"}]}}',
        'data: {"type":"data-search-tasks","data":{"tasks":[{"id":"task_1","title":"Search","status":"completed"}]}}',
        'data: {"type":"data-search-step","data":{"query":"convex"}}',
        'data: {"type":"reasoning-delta","delta":"Check sources. "}',
        'data: {"type":"text-delta","delta":"Convex is "}',
        'data: {"type":"text-delta","delta":"a backend."}',
        "data: [DONE]",
      ].join("\n"),
      "/deep-research",
      true,
    );

    expect(result.text).toBe("Convex is a backend.");
    expect(result.reasoning).toBe("Check sources. ");
    expect(result.message_id).toBe("msg_1");
    expect(result.metadata).toEqual({ trace_id: "trace_1" });
    expect(result.references).toHaveLength(1);
    expect(result.referenceChunks).toHaveLength(1);
    expect(result.searchSteps).toHaveLength(1);
    expect(result.tasks).toEqual([
      { id: "task_1", title: "Search", status: "completed" },
    ]);
    expect(result.event_counts["text-delta"]).toBe(2);
    expect(result.raw_events).toHaveLength(9);
  });

  test("terminates at DONE and ignores later lines", async () => {
    const result = await _test.parseSseText(
      [
        'data: {"type":"text-delta","delta":"first"}',
        "data: [DONE]",
        'data: {"type":"text-delta","delta":"second"}',
      ].join("\n"),
    );

    expect(result.text).toBe("first");
  });

  test("throws on stream data-error events", async () => {
    await expect(
      _test.parseSseText(
        'data: {"type":"data-error","code":"RATE_LIMITED","message":"Too many requests"}',
        "/ai-search",
      ),
    ).rejects.toThrow(/Too many requests/);
  });

  test("throws on non-JSON payloads", () => {
    expect(() => _test.tryParseJson("not-json")).toThrow(
      /non-JSON response/,
    );
  });
});
