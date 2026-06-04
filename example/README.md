# convex-liner example

Complete example showing how to use `@liner/convex-liner` from a Convex app.

## Prerequisites

Before running this example, you will need:

1. A [Liner](https://liner.com/developers) account and API key
2. A [Convex](https://convex.dev) account

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
LINER_API_KEY=your_liner_api_key
```

You can also set it from the CLI:

```bash
npx convex env set LINER_API_KEY your_liner_api_key
```

### 4. Run the examples

With `npx convex dev` still running, open another terminal and run:

**Web search**

```bash
npx convex run example:webSearch '{
  "query": "recent AI regulation updates",
  "country_code": "us",
  "lang": "en",
  "date_range": "past_week",
  "max_results": 10
}'
```

**Scholar search**

```bash
npx convex run example:scholarSearch '{
  "query": "retrieval augmented generation evaluation",
  "lang": "en",
  "max_results": 5
}'
```

**Quick answer**

```bash
npx convex run example:quickAnswer '{
  "question": "What is the capital of France?"
}'
```

**AI Search**

```bash
npx convex run example:aiSearch '{
  "question": "What are the latest developments in quantum computing?",
  "mode": "general"
}'
```

**AI Search Pro**

```bash
npx convex run example:aiSearchPro '{
  "question": "Compare recent frontier AI model launches"
}'
```

**Deep Research**

```bash
npx convex run example:deepResearch '{
  "question": "Compare the effectiveness of mRNA vs protein subunit COVID vaccines"
}'
```

**Deep Research Pro**

```bash
npx convex run example:deepResearchPro '{
  "question": "Write a cited research brief on AI search API price and accuracy tradeoffs"
}'
```

