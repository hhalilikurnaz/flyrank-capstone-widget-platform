import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Submission tests share the in-memory rate limiter and the same DB —
    // running files in parallel workers would make request counts and
    // per-widget aggregates flaky across files.
    fileParallelism: false,
  },
});
