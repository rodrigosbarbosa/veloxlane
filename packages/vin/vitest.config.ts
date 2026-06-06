import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/validation.ts", "src/cache.ts", "src/lookup.ts"],
      exclude: [
        "src/index.ts",
        "src/fetch.ts",
        "src/types.ts",
        "src/**/*.test.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 87,
        statements: 100,
      },
    },
  },
});
