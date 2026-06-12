# liner-convex example

Complete example showing how to use `liner-convex` from a Convex app.

## Prerequisites

Before running this example, you will need:

1. A [Liner](https://liner.com/developers) account with MCP OAuth access
2. A Liner OAuth access token with scope `mcp`
3. A [Convex](https://convex.dev) account

## Setup

### 1. Install dependencies

```bash
cd example
npm install
```

### 2. Start Convex

```bash
npx convex dev
```

### 3. Set the environment variable

In the Convex dashboard, add:

```bash
LINER_MCP_ACCESS_TOKEN=your_oauth_access_token
```

You can also set it from the CLI:

```bash
npx convex env set LINER_MCP_ACCESS_TOKEN your_oauth_access_token
```

Do not use a Liner API key. Liner MCP now requires OAuth.

### 4. Run the examples

With `npx convex dev` still running, open another terminal and run:

**Web search**

```bash
npx convex run example:searchWeb '{
  "query": "recent AI regulation updates",
  "limit": 10
}'
```

**Scholar search**

```bash
npx convex run example:searchScholar '{
  "query": "retrieval augmented generation evaluation",
  "limit": 5
}'
```

**Quick Answer Agent**

```bash
npx convex run example:quickAnswerAgent '{
  "question": "What is the capital of France?"
}'
```

**Search Agent**

```bash
npx convex run example:searchAgent '{
  "question": "Compare Liner, Exa, and Tavily for developer-facing search APIs"
}'
```

**Deep Research Agent**

```bash
npx convex run example:deepResearchAgent '{
  "question": "Write a cited research brief on AI search API price and accuracy tradeoffs"
}'
```
