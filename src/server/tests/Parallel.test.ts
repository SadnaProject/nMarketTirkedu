import { describe, expect, it } from "vitest";
import { benchmark } from "./_benchmark";

// since action takes time, it returns a promise
async function action(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
  return Math.floor(Math.random() * 10); // random number between 0 and 9
}

describe("parallel actions", () => {
  it("✅runs 100 parallel actions", async () => {
    const promises: Promise<number>[] = [];
    for (let i = 0; i < 100; i++) {
      promises.push(action());
    }
    const results = await Promise.all(promises); // wait for all promises to succeed
    // expect all results to be between 0 and 9
    expect(results.every((result) => result >= 0 && result <= 9)).toBe(true);
  });

  // Promise functions:
  // - Promise.all - waits for all promises to succeed. Throws if some of them fail.
  // - Promise.allSettled - waits for all promises to end. Doesn't throw.
  // - Promise.any - waits until a promise succeeds. Throws if all of them fail.
  // - Promise.race - waits until a promise ends. Throws if it fails.

  it(
    "✅benchmark action",
    async () => {
      // start measuring after 4 seconds, stop after 5 seconds
      await benchmark(() => action(), 4000, 5000);
    },
    { timeout: 6000 } // stop test anyway after 6 seconds
  );
});
