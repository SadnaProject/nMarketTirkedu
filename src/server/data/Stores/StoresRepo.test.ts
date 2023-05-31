import { beforeEach, describe, expect, it } from "vitest";
import {
  type Repos,
  createMockRepos,
} from "server/domain/Stores/helpers/_HasRepos";
import { Store } from "server/domain/Stores/Store";
import { createMockControllers } from "server/domain/helpers/_createControllers";
import { type Controllers } from "server/domain/helpers/_HasController";
import { generateStoreName } from "./helpers/_data";
import { resetDB } from "server/helpers/_Transactional";

let repos: Repos;
let controllers: Controllers;
beforeEach(async () => {
  await resetDB();

  repos = createMockRepos("Stores");
  controllers = createMockControllers("Stores");
});

describe("add store", () => {
  it("✅adds store bla", async () => {
    const store = new Store(generateStoreName())
      .initRepos(repos)
      .initControllers(controllers);
    await repos.Stores.addStore(store.Name, store.Id);
    const stores = await repos.Stores.getAllStores();
    expect(stores).toHaveLength(1);
    expect(stores[0]?.id).toEqual(store.Id);
  });
});

describe("get all stores", () => {
  it("✅returns no stores", async () => {
    const stores = await repos.Stores.getAllStores();
    expect(stores).toEqual([]);
  });
});

describe("get all names", () => {
  it("✅returns no names", async () => {
    expect(await repos.Stores.getAllNames()).toEqual(new Set());
  });

  it("✅returns some names", async () => {
    const name1 = generateStoreName();
    const name2 = generateStoreName();
    const store1 = new Store(name1)
      .initRepos(repos)
      .initControllers(controllers);
    const store2 = new Store(name2)
      .initRepos(repos)
      .initControllers(controllers);
    await repos.Stores.addStore(name1, store1.Id);
    await repos.Stores.addStore(name2, store2.Id);
    const names = await repos.Stores.getAllNames();
    expect(names).toEqual(new Set([name1, name2]));
  });
});

describe("get store by id", () => {
  it("✅returns store", async () => {
    const store = new Store(generateStoreName())
      .initRepos(repos)
      .initControllers(controllers);
    await repos.Stores.addStore(store.Name, store.Id);
    const storeDAO = await repos.Stores.getStoreById(store.Id);
    expect(storeDAO.id).toEqual(store.Id);
    expect(storeDAO.name).toEqual(store.Name);
    expect(storeDAO.isActive).toEqual(store.IsActive());
  });

  it("❎doesn't find store", async () => {
    await expect(
      async () => await repos.Stores.getStoreById("made up id")
    ).rejects.toThrow();
  });
});

describe("delete store", () => {
  it("✅deletes store", async () => {
    const store = new Store(generateStoreName())
      .initRepos(repos)
      .initControllers(controllers);
    await repos.Stores.addStore(store.Name, store.Id);
    await repos.Stores.deleteStore(store.Id);
    expect(await repos.Stores.getAllStores()).toEqual([]);
  });

  it("❎doesn't find store", async () => {
    await expect(() =>
      repos.Stores.deleteStore("made up id")
    ).rejects.toThrow();
  });
});
