import { defineApp } from "convex/server";
import { v } from "convex/values";
import liner from "@liner/convex-liner/convex.config";

const app = defineApp({
  env: {
    LINER_API_KEY: v.string(),
  },
});

app.use(liner, {
  name: "liner",
  env: {
    LINER_API_KEY: app.env.LINER_API_KEY,
  },
});

export default app;

