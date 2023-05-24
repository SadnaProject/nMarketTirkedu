import { beforeEach, describe, expect, it } from "vitest";
import { createStore, generateStoreName } from "../_data";
import { type Repos, createMockRepos } from "../_HasRepos";
import { createMockControllers } from "server/domain/_createControllers";
import { type Controllers } from "server/domain/_HasController";
import { Store } from "../Store";

let repos: Repos;
let controllers: Controllers;
beforeEach(() => {
  repos = createMockRepos("Stores");
  controllers = createMockControllers("Stores");
});

describe("add store", () => {
  it("✅adds store", async () => {
    const store = createStore(generateStoreName(), repos, controllers);
    expect(
      async () => await repos.Stores.addStore(store.Name, store.Id)
    ).not.toThrow();
    const stores = await repos.Stores.getAllStores();
    expect(stores).toHaveLength(1);
    expect(stores[0]?.id).toEqual(store.Id);
  });
});

describe("get all stores", () => {
  it("✅returns no stores", async () => {
    expect(await repos.Stores.getAllStores()).toEqual([]);
  });
});

describe("get all names", () => {
  it("✅returns no names", async () => {
    expect(await repos.Stores.getAllNames()).toEqual(new Set());
  });

  it("✅returns some names", async () => {
    const name1 = generateStoreName();
    const name2 = generateStoreName();
    const store1 = createStore(name1, repos, controllers);
    const store2 = createStore(name2, repos, controllers);
    await repos.Stores.addStore(store1.Name, store1.Id);
    await repos.Stores.addStore(store2.Name, store2.Id);
    expect(await repos.Stores.getAllNames()).toEqual(new Set([name1, name2]));
  });
});

describe("get store by id", () => {
  it("✅returns store", async () => {
    const store = createStore(generateStoreName(), repos, controllers);
    await repos.Stores.addStore(store.Name, store.Id);
    const storeDAO = await repos.Stores.getStoreById(store.Id);
    expect(storeDAO.id).toEqual(store.Id);
    expect(storeDAO.name).toEqual(store.Name);
    expect(storeDAO.isActive).toEqual(store.IsActive());
  });

  it("❎doesn't find store", () => {
    expect(async () => await repos.Stores.getStoreById("made up id")).toThrow(
      "Store not found"
    );
  });
});

describe("delete store", () => {
  it("✅deletes store", async () => {
    const store = createStore(generateStoreName(), repos, controllers);
    await repos.Stores.addStore(store.Name, store.Id);
    expect(async () => await repos.Stores.deleteStore(store.Id)).not.toThrow();
    expect(await repos.Stores.getAllStores()).toEqual([]);
  });

  it("❎doesn't find store", () => {
    expect(async () => await repos.Stores.deleteStore("made up id")).toThrow(
      "Store not found"
    );
  });
});
