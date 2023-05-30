/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from "vitest";
import { HasContext, getContext, hasContext, runWithContext } from "./_Context";
import {
  createMockRepos,
  createRepos,
  getRepos,
} from "../Users/helpers/_HasRepos";

@hasContext
class A extends HasContext {
  getDeepContext() {
    return new B().addContext({ b: 2 }).getDeepContext();
  }
}
@hasContext
class B extends HasContext {
  getDeepContext() {
    return new C().getDeepContext();
  }
}
class C {
  getDeepContext() {
    return getContext();
  }
}

describe("Context", () => {
  it("should work", async () => {
    await expect(new A().getDeepContext()).resolves.toEqual({
      b: 2,
    });
    await expect(
      new A().addContext({ a: 1 }).getDeepContext()
    ).resolves.toEqual({
      a: 1,
      b: 2,
    });
    await expect(
      new A().addContext({ b: 1 }).getDeepContext()
    ).resolves.toEqual({
      b: 2,
    });
  });
});

@hasContext
class Controller extends HasContext {
  getDeepRepos() {
    return new SomeClass().getDeepRepos();
  }
}
class SomeClass {
  getDeepRepos() {
    return getRepos();
  }
}

describe("Real life examples", () => {
  it("works in production", async () => {
    const controller = new Controller().addContext({ repos: createRepos() });
    await expect(controller.getDeepRepos()).resolves.toEqual({
      Users: expect.anything(),
      Bids: expect.anything(),
      BasketProducts: expect.anything(),
    });
  });

  it("unit tests", async () => {
    const someClass = new SomeClass();
    await expect(
      runWithContext({ repos: createMockRepos() }, () =>
        someClass.getDeepRepos()
      )
    ).resolves.toEqual({
      Users: expect.anything(),
      Bids: expect.anything(),
      BasketProducts: expect.anything(),
    });
  });
});
