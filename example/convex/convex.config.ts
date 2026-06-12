import { defineApp } from "convex/server";
import { v } from "convex/values";
import liner from "liner-convex/convex.config";

const app = defineApp({
  env: {
    LINER_MCP_ACCESS_TOKEN: v.string(),
  },
});

app.use(liner, {
  name: "liner",
  env: {
    LINER_MCP_ACCESS_TOKEN: app.env.LINER_MCP_ACCESS_TOKEN,
  },
});

export default app;
