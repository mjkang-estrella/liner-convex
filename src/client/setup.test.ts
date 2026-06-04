import { test } from "vitest";
import { componentsGeneric } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export const components = componentsGeneric() as unknown as {
  liner: ComponentApi;
};

test("setup", () => {});

