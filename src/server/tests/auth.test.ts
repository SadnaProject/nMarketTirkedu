import { describe, expect, it } from "vitest";
//* Vitest Docs: https://vitest.dev/api

describe("test name", () => {
  it("should throw an error if not logged in", async () => {
    await expect(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error("Not logged in");
    }).rejects.toThrow();
  });
});
