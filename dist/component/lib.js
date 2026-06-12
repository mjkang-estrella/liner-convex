import { v } from "convex/values";
import { action, env } from "./_generated/server.js";
const LINER_MCP_URL = "https://platform.liner.com/api/v1/mcp";
const messageValidator = v.object({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
});
const searchArgsValidator = {
    query: v.string(),
    limit: v.optional(v.number()),
};
const agentArgsValidator = {
    messages: v.array(messageValidator),
};
function buildMcpHeaders(accessToken) {
    return {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
    };
}
function buildToolCallBody(toolName, args) {
    return {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: toolName,
            arguments: args,
        },
    };
}
async function callMcpTool(toolName, args) {
    const response = await fetch(LINER_MCP_URL, {
        method: "POST",
        headers: new Headers(buildMcpHeaders(getAccessToken())),
        body: JSON.stringify(buildToolCallBody(toolName, args)),
    });
    const text = await response.text();
    const envelope = parseMcpEnvelope(text, response.headers.get("content-type"));
    if (!response.ok) {
        throw new Error(`Liner MCP ${toolName} failed (${response.status}): ${extractErrorMessage(envelope?.error, text, response.statusText)}`.trim());
    }
    if (envelope?.error !== undefined) {
        throw new Error(`Liner MCP ${toolName} failed: ${extractErrorMessage(envelope.error, text, "MCP error")}`.trim());
    }
    return normalizeToolResult(toolName, envelope?.result);
}
function parseMcpEnvelope(text, contentType) {
    if (text.length === 0) {
        return undefined;
    }
    if (contentType?.includes("text/event-stream")) {
        return parseMcpSseEnvelope(text);
    }
    return tryParseJson(text);
}
function parseMcpSseEnvelope(text) {
    let envelope;
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) {
            continue;
        }
        const payload = line.slice("data:".length).trim();
        if (!payload || payload === "[DONE]") {
            continue;
        }
        envelope = tryParseJson(payload);
    }
    return envelope;
}
function parseTextContent(content) {
    if (!Array.isArray(content)) {
        return [];
    }
    return content
        .filter((item) => isRecord(item) && item.type === "text" && item.text)
        .map((item) => {
        const text = String(item.text);
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    });
}
function normalizeEvents(events) {
    const text = events
        .filter((event) => isRecord(event) && event.type === "text-delta")
        .map((event) => String(event.delta ?? ""))
        .join("");
    const start = events.find((event) => isRecord(event) && event.type === "start");
    const metadata = isRecord(start) && isRecord(start.message_metadata)
        ? start.message_metadata
        : {};
    const referenceEvent = events.find((event) => isRecord(event) && event.type === "data-search-references");
    const references = isRecord(referenceEvent) &&
        isRecord(referenceEvent.data) &&
        Array.isArray(referenceEvent.data.references)
        ? referenceEvent.data.references
        : [];
    return {
        answer: text,
        text,
        message_id: isRecord(start) ? start.message_id : undefined,
        request_id: isRecord(metadata) ? metadata.request_id : undefined,
        trace_id: isRecord(metadata) ? metadata.trace_id : undefined,
        references,
        events,
    };
}
function normalizeToolResult(toolName, result) {
    const toolResult = isRecord(result) ? result : {};
    if (toolResult.isError) {
        const errorText = parseTextContent(toolResult.content).join("\n");
        throw new Error(errorText || `${toolName} returned an error`);
    }
    const parsed = parseTextContent(toolResult.content);
    if (parsed.length === 1) {
        const value = parsed[0];
        if (Array.isArray(value)) {
            return normalizeEvents(value);
        }
        if (isRecord(value)) {
            return {
                ...value,
                request_id: value.requestId ?? value.request_id,
                total_count: value.totalCount ?? value.total_count,
            };
        }
        return { text: String(value) };
    }
    return {
        content: parsed,
        raw_result: result,
    };
}
function tryParseJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error("Liner MCP returned a non-JSON response.");
    }
}
function extractErrorMessage(parsed, rawText, fallback) {
    if (parsed && typeof parsed === "object") {
        if ("message" in parsed && typeof parsed.message === "string") {
            return parsed.message;
        }
        if ("code" in parsed && "error" in parsed) {
            return `${String(parsed.code)}: ${String(parsed.error)}`;
        }
        if ("error" in parsed) {
            const error = parsed.error;
            if (typeof error === "string") {
                return error;
            }
            if (error && typeof error === "object") {
                if ("message" in error && typeof error.message === "string") {
                    return error.message;
                }
                if ("code" in error && typeof error.code === "string") {
                    return error.code;
                }
            }
        }
    }
    return rawText.slice(0, 300) || fallback;
}
function isRecord(value) {
    return value !== null && typeof value === "object";
}
function getAccessToken() {
    const accessToken = env.LINER_MCP_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error("Missing LINER_MCP_ACCESS_TOKEN for the Liner component.");
    }
    return accessToken;
}
export const searchWeb = action({
    args: searchArgsValidator,
    returns: v.any(),
    handler: async (_ctx, args) => {
        return await callMcpTool("search_web", args);
    },
});
export const searchScholar = action({
    args: searchArgsValidator,
    returns: v.any(),
    handler: async (_ctx, args) => {
        return await callMcpTool("search_scholar", args);
    },
});
export const quickAnswerAgent = action({
    args: agentArgsValidator,
    returns: v.any(),
    handler: async (_ctx, args) => {
        return await callMcpTool("quick_answer_agent", args);
    },
});
export const searchAgent = action({
    args: agentArgsValidator,
    returns: v.any(),
    handler: async (_ctx, args) => {
        return await callMcpTool("search_agent", args);
    },
});
export const deepResearchAgent = action({
    args: agentArgsValidator,
    returns: v.any(),
    handler: async (_ctx, args) => {
        return await callMcpTool("deep_research_agent", args);
    },
});
export const _test = {
    buildMcpHeaders,
    buildToolCallBody,
    extractErrorMessage,
    normalizeToolResult,
    parseMcpEnvelope,
    parseMcpSseEnvelope,
    tryParseJson,
};
//# sourceMappingURL=lib.js.map