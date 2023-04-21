import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src/server",
    restoreMocks: true,
    coverage: {
      exclude: ["**/_*.ts"],
      provider: "istanbul",
      reporter: ["lcov"],
    },
  },
  plugins: [],
  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },
});
