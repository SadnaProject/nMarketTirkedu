import { defineConfig } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";

export default defineConfig({
  test: {
    dir: "src/server/",
    restoreMocks: true,
    reporters: ["default", "html"],
    outputFile: "./test-results/index.html",
    coverage: {
      exclude: ["**/_*.ts"],
      provider: "istanbul",
      reporter: ["lcov", "html"],
    },
    include: [
      // "**/UserRepo.test.ts",
      // "**/User.test.ts",
      // "**/Bid.test.ts",
      // "Basket.test.ts",
      // "**/UsersController.test.ts",
      //STILL NEED TO BE DONE:
      // "**/DeliveryAdaptor.test.ts",
      //Done:
      //"**/Owner.test.ts", //(all tests pass except Add Constraint see todo their @ilaytzarfati1231)
      // run PurchasesHistoryController.test.ts
      "**/PurchasesHistoryController.test.ts",
      // "**/Admin.test.ts",
      // "**/Member.test.ts",
      // "**/Guest.test.ts",
      // "**/System.test.ts",
      // "**/HW.test.ts",
    ],
    //make the tests run in an order and not in parallel
    threads: false,
    testTimeout: 1000000,
    hookTimeout: 1000000,
    // include only PurchasesHistoryController.test.ts
  },
  plugins: [tsconfigPaths()],
  // resolve: {
  // alias: {
  //   "@": path.resolve(__dirname, "./src"),
  // },
  // },
});
