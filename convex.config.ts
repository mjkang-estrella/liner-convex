import { defineComponent } from "convex/server";
import { v } from "convex/values";

export default defineComponent("liner", {
  env: {
    LINER_API_KEY: v.string(),
  },
});
