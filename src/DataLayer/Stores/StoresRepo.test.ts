import { beforeEach, describe, expect, it } from "vitest";
import { StoresRepo } from "./StoresRepo";
import { generateStoreName } from "~/DomainLayer/Stores/Store.test";
import { Store } from "~/DomainLayer/Stores/Store";

let repo: StoresRepo;

beforeEach(() => {
  repo = new StoresRepo();
});

describe("add store", () => {
  it("✅adds store", () => {
    const store = new Store(generateStoreName());
    expect(() => repo.addStore(store.DTO)).not.toThrow();
    expect(repo.getAllStores()).toEqual([store.DTO]);
  });
});

describe("get all stores", () => {
  it("✅returns no stores", () => {
    expect(repo.getAllStores()).toEqual([]);
  });
});

describe("get all names", () => {
  it("✅returns no names", () => {
    expect(repo.getAllNames()).toEqual(new Set());
  });

  it("✅returns some names", () => {
    const name1 = generateStoreName();
    const name2 = generateStoreName();
    repo.addStore(new Store(name1).DTO);
    repo.addStore(new Store(name2).DTO);
    expect(repo.getAllNames()).toEqual(new Set([name1, name2]));
  });
});

describe("get store by id", () => {
  it("✅returns store", () => {
    const store = new Store(generateStoreName());
    repo.addStore(store.DTO);
    expect(repo.getStoreById(store.Id)).toEqual(store.DTO);
  });

  it("❎doesn't find store", () => {
    expect(() => repo.getStoreById("made up id")).toThrow("Store not found");
  });
});

describe("set is active", () => {
  it("✅sets is active", () => {
    const store = new Store(generateStoreName());
    repo.addStore(store.DTO);
    expect(() => repo.setIsActive(store.Id, false)).not.toThrow();
    expect(repo.getStoreById(store.Id).isActive).toBe(false);
  });

  it("❎doesn't find store", () => {
    expect(() => repo.setIsActive("made up id", false)).toThrow(
      "Store not found"
    );
  });
});

describe("delete store", () => {
  it("✅deletes store", () => {
    const store = new Store(generateStoreName());
    repo.addStore(store.DTO);
    expect(() => repo.deleteStore(store.Id)).not.toThrow();
    expect(repo.getAllStores()).toEqual([]);
  });

  it("❎doesn't find store", () => {
    expect(() => repo.deleteStore("made up id")).toThrow("Store not found");
  });
});
