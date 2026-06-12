import { describe, expect, test } from "vitest";
import { _test } from "./lib.js";

describe("component helpers", () => {
  test("headers include OAuth bearer authentication for MCP", () => {
    expect(_test.buildMcpHeaders("access_123")).toEqual({
      Authorization: "Bearer access_123",
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    });
  });

  test("builds MCP tools/call requests", () => {
    expect(
      _test.buildToolCallBody("search_agent", {
        messages: [{ role: "user", content: "What is Convex?" }],
      }),
    ).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "search_agent",
        arguments: {
          messages: [{ role: "user", content: "What is Convex?" }],
        },
      },
    });
  });

  test("parses JSON and SSE MCP envelopes", () => {
    expect(
      _test.parseMcpEnvelope(
        '{"jsonrpc":"2.0","id":1,"result":{"ok":true}}',
        "application/json",
      ),
    ).toEqual({ jsonrpc: "2.0", id: 1, result: { ok: true } });

    expect(
      _test.parseMcpEnvelope(
        [
          'event: message',
          'data: {"jsonrpc":"2.0","id":1,"result":{"ok":true}}',
          "",
        ].join("\n"),
        "text/event-stream",
      ),
    ).toEqual({ jsonrpc: "2.0", id: 1, result: { ok: true } });
  });

  test("normalizes structured MCP text content", () => {
    expect(
      _test.normalizeToolResult("search_web", {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              requestId: "req_123",
              totalCount: 1,
              results: [{ title: "Example", url: "https://example.com" }],
            }),
          },
        ],
      }),
    ).toEqual({
      requestId: "req_123",
      request_id: "req_123",
      totalCount: 1,
      total_count: 1,
      results: [{ title: "Example", url: "https://example.com" }],
    });
  });

  test("normalizes streamed event arrays from agent tools", () => {
    expect(
      _test.normalizeToolResult("search_agent", {
        content: [
          {
            type: "text",
            text: JSON.stringify([
              {
                type: "start",
                message_id: "msg_1",
                message_metadata: { request_id: "req_1", trace_id: "trace_1" },
              },
              {
                type: "data-search-references",
                data: {
                  references: [
                    { title: "Convex", url: "https://convex.dev" },
                  ],
                },
              },
              { type: "text-delta", delta: "Convex is " },
              { type: "text-delta", delta: "a backend." },
            ]),
          },
        ],
      }),
    ).toEqual({
      answer: "Convex is a backend.",
      text: "Convex is a backend.",
      message_id: "msg_1",
      request_id: "req_1",
      trace_id: "trace_1",
      references: [{ title: "Convex", url: "https://convex.dev" }],
      events: [
        {
          type: "start",
          message_id: "msg_1",
          message_metadata: { request_id: "req_1", trace_id: "trace_1" },
        },
        {
          type: "data-search-references",
          data: {
            references: [{ title: "Convex", url: "https://convex.dev" }],
          },
        },
        { type: "text-delta", delta: "Convex is " },
        { type: "text-delta", delta: "a backend." },
      ],
    });
  });

  test("throws on MCP tool errors", () => {
    expect(() =>
      _test.normalizeToolResult("search_agent", {
        isError: true,
        content: [{ type: "text", text: "OAuth token expired" }],
      }),
    ).toThrow(/OAuth token expired/);
  });

  test("extracts error messages from common MCP error shapes", () => {
    expect(
      _test.extractErrorMessage(
        { error: { message: "Invalid token" } },
        "",
        "fallback",
      ),
    ).toBe("Invalid token");
    expect(
      _test.extractErrorMessage(
        { code: "UNAUTHORIZED", error: "login required" },
        "",
        "fallback",
      ),
    ).toBe("UNAUTHORIZED: login required");
  });

  test("throws on non-JSON payloads", () => {
    expect(() => _test.tryParseJson("not-json")).toThrow(
      /non-JSON response/,
    );
  });
});
