import { beforeEach, describe, expect, it } from "vitest";
import { createStore, generateStoreName } from "../_data";
import { type Repos, createMockRepos } from "../_HasRepos";
import { createMockControllers } from "server/domain/_createControllers";
import { type Controllers } from "server/domain/_HasController";

let repos: Repos;
let controllers: Controllers;
beforeEach(() => {
  repos = createMockRepos("Stores");
  controllers = createMockControllers("Stores");
});

describe("add store", () => {
  it("✅adds store", () => {
    const store = createStore(generateStoreName(), repos, controllers);
    expect(() => repos.Stores.addStore(store)).not.toThrow();
    expect(repos.Stores.getAllStores()).toEqual([store]);
  });
});

describe("get all stores", () => {
  it("✅returns no stores", () => {
    expect(repos.Stores.getAllStores()).toEqual([]);
  });
});

describe("get all names", () => {
  it("✅returns no names", () => {
    expect(repos.Stores.getAllNames()).toEqual(new Set());
  });

  it("✅returns some names", () => {
    const name1 = generateStoreName();
    const name2 = generateStoreName();
    repos.Stores.addStore(createStore(name1, repos, controllers));
    repos.Stores.addStore(createStore(name2, repos, controllers));
    expect(repos.Stores.getAllNames()).toEqual(new Set([name1, name2]));
  });
});

describe("get store by id", () => {
  it("✅returns store", () => {
    const store = createStore(generateStoreName(), repos, controllers);
    repos.Stores.addStore(store);
    expect(repos.Stores.getStoreById(store.Id)).toEqual(store);
  });

  it("❎doesn't find store", () => {
    expect(() => repos.Stores.getStoreById("made up id")).toThrow(
      "Store not found"
    );
  });
});

describe("delete store", () => {
  it("✅deletes store", () => {
    const store = createStore(generateStoreName(), repos, controllers);
    repos.Stores.addStore(store);
    expect(() => repos.Stores.deleteStore(store.Id)).not.toThrow();
    expect(repos.Stores.getAllStores()).toEqual([]);
  });

  it("❎doesn't find store", () => {
    expect(() => repos.Stores.deleteStore("made up id")).toThrow(
      "Store not found"
    );
  });
});
