import { defineConfig } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";

export default defineConfig({
  test: {
    dir: "src/server",
    restoreMocks: true,
    setupFiles: "vitest.setup.ts",
    coverage: {
      exclude: ["**/_*.ts"],
      provider: "istanbul",
      reporter: ["lcov"],
    },
    include: [
      // "**/testingDb.test.ts",
      // "**/AuthController.test.ts",
      // "**/UserAuthRepo.test.ts",
      "**/MemberUserAuth.test.ts",
      // "**/Session.test.ts",
      "**/testingDbJobs.test.ts",
      // "**/ReviewRepo.test.ts",
      // "**/ProductPurchaseHistoryRepo.test.ts",
      "**/checkDB.test.ts",
    ],
    //make the tests run in an order and not in parallel
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
