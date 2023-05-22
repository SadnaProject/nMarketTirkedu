import { defineConfig } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";

export default defineConfig({
  test: {
    dir: "src/server",
    restoreMocks: true,
    coverage: {
      exclude: ["**/_*.ts"],
      provider: "istanbul",
      reporter: ["lcov"],
    },
    //make the tests run in an order and not in parallel
    include: [
      // "**/testingDb.test.ts",
      // "**/AuthController.test.ts",
      // "**/UserAuthRepo.test.ts",
      // "**/MemberUserAuth.test.ts",
      // "**/Session.test.ts",
      // "**/testingDbJobs.test.ts",
      "**/ProductPurchaseHistoryRepo.test.ts",
    ],
    threads: false,
    testTimeout: 20000,
  },
  plugins: [tsconfigPaths()],
  // resolve: {
  // alias: {
  //   "@": path.resolve(__dirname, "./src"),
  // },
  // },
});
