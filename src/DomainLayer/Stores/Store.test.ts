import { describe, expect, it } from "vitest";
import { Store } from "./Store";
//* Vitest Docs: https://vitest.dev/api

const storeName = "store name";

describe("constructor", () => {
  it("✅creates a store", () => {
    expect(() => {
      const store = new Store(storeName);
      expect(store.Name).toBe(storeName);
    }).not.toThrow();
  });

  it("❎gets empty name", () => {
    expect(() => new Store("")).toThrow();
  });
});
