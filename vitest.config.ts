import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    restoreMocks: true,
    coverage: {
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
