import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
//* Vitest Docs: https://vitest.dev/api

const store = new Store("name");

describe("Name", () => {
  it("works", () => {
    expect(store.Name).toBe("name");
  });

  it("mock", () => {
    const storeNameMock = vi.spyOn(store, "Name", "get");
    storeNameMock.mockReturnValueOnce("mock1");
    expect(store.Name).toBe("mock1");
    expect(store.Name).toBe("name");
    expect(storeNameMock).toBeCalledTimes(2);

    storeNameMock.mockReturnValue("mock2");
    expect(store.Name).toBe("mock2");
    expect(store.Name).toBe("mock2");
    expect(storeNameMock).toBeCalledTimes(4);
  });

  it("auto restore mock", () => {
    expect(store.Name).toBe("name");
  });

  it("auto restore mock", async () => {
    expect(() => {
      throw new Error("error");
    }).toThrow();
  });
});
