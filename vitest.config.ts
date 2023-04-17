import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    restoreMocks: true,
    coverage: {
      exclude: [
        "**/HasRepos.ts",
        "**/HasController.ts",
        "**/createControllers.ts",
        "**/Testable.ts",
        "**/data.ts",
      ],
      provider: "istanbul",
      reporter: ["lcov"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
