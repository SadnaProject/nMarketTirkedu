import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestControllers } from "../createControllers";
import { type Repos, createTestRepos } from "./HasRepos";
import { generateProductDTO } from "./StoreProduct.test";
import { createStore, generateStoreName } from "./Store.test";
import { type Controllers } from "../HasController";
import { type StoreProductDTO } from "./StoreProduct";
import { type SearchArgs } from "./StoresController";

describe("search products", () => {
  let repos: Repos;
  let controllers: Controllers;
  let products: StoreProductDTO[];
  beforeEach(() => {
    repos = createTestRepos();
    controllers = createTestControllers("Stores");
    controllers.Stores.initRepos(repos);
    products = Array.from({ length: 3 }, () => generateProductDTO());

    vi.spyOn(repos.Products, "getAllProducts").mockReturnValue(products);
    const store = createStore(generateStoreName(), repos);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(store.Id);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store.DTO);
    vi.spyOn(controllers.PurchasesHistory, "getStoreRating").mockReturnValue(3);
    vi.spyOn(
      controllers.PurchasesHistory,
      "getReviewsByProduct"
    ).mockReturnValue({
      avgRating: 3.5,
      reviews: [],
    });
  });

  it("✅should return all products", () => {
    const res = controllers.Stores.searchProducts({});
    expect(res).toEqual(products);
  });

  it("✅should return some products because of name filter", () => {
    const res = controllers.Stores.searchProducts({
      name: products[0]?.name.toUpperCase().split(" ")[0],
    });
    expect(res).toContainEqual(products[0]);
  });

  it("✅should return some products because of keywords", () => {
    const res = controllers.Stores.searchProducts({
      keywords: [products[1]?.description.toUpperCase().split(" ")[1] ?? ""],
    });
    expect(res).toContainEqual(products[1]);
  });

  it("✅shouldn't return products because of made up name", () => {
    const res = controllers.Stores.searchProducts({
      name: "made up name that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up category", () => {
    const res = controllers.Stores.searchProducts({
      category: "made up category that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up keywords", () => {
    const res = controllers.Stores.searchProducts({
      keywords: ["made up keyword that doesn't exist"],
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min price", () => {
    const res = controllers.Stores.searchProducts({
      minPrice: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max price", () => {
    const res = controllers.Stores.searchProducts({
      maxPrice: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min store rating", () => {
    const res = controllers.Stores.searchProducts({
      minStoreRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max store rating", () => {
    const res = controllers.Stores.searchProducts({
      maxStoreRating: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min product rating", () => {
    const res = controllers.Stores.searchProducts({
      minProductRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max product rating", () => {
    const res = controllers.Stores.searchProducts({
      maxProductRating: 0,
    });
    expect(res).toEqual([]);
  });
});
