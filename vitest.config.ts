import { defineConfig } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";

export default defineConfig({
  test: {
    dir: "src/server/tests",
    restoreMocks: true,
    reporters: ["default", "html"],
    outputFile: "./test-results/index.html",
    coverage: {
      exclude: ["**/_*.ts"],
      provider: "istanbul",
      reporter: ["lcov", "html"],
    },
    include: [
      //   "**/testingDb.test.ts",
      // "**/AuthController.test.ts",
      // "**/UserAuthRepo.test.ts",
      // "**/MemberUserAuth.test.ts",
      // "**/Session.test.ts",
      // "**/JobsController.test.ts",

      //   // "**/ReviewRepo.test.ts",
      //   // "**/ProductPurchaseHistoryRepo.test.ts",
      // "**/checkDB.test.ts",
      //   // "**/User.test.ts",
      //   // "**/Basket.test.ts",
      // "**/UserRepo.test.ts",
      // "**/Basket.test.ts",
      // "**/Cart.test.ts",
      // "**/UsersController.test.ts",
      // "**/UsersRepo.test.ts",

      // "**/BasketPurchaseHistoryRepo.test.ts",

      //"**/PurchasesHistoryController.test.ts",
      "**/Owner.test.ts",
    ],
    //make the tests run in an order and not in parallel
    threads: false,
    testTimeout: 100000,
  },
  plugins: [tsconfigPaths()],
  // resolve: {
  // alias: {
  //   "@": path.resolve(__dirname, "./src"),
  // },
  // },
});
