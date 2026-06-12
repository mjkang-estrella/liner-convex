import { defineComponent } from "convex/server";
import { v } from "convex/values";

export default defineComponent("liner", {
  env: {
    LINER_MCP_ACCESS_TOKEN: v.string(),
  },
});
