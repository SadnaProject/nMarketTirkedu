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
    include: [
      //"**/testingDb.test.ts",
      //"**/AuthController.test.ts",
      // "**/UserAuthRepo.test.ts",
      "**/MemberUserAuth.test.ts",
    ],
  },
  plugins: [tsconfigPaths()],
  // resolve: {
  // alias: {
  //   "@": path.resolve(__dirname, "./src"),
  // },
  // },
});
