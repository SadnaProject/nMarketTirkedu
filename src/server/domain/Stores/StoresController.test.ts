import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockControllers } from "../_createControllers";
import { type Repos, createMockRepos } from "./_HasRepos";
import {
  createProduct,
  createStore,
  generateProductArgs,
  generateStoreName,
} from "./_data";
import { type Controllers } from "../_HasController";
import { type StoreProduct } from "./StoreProduct";

describe("search products", () => {
  let repos: Repos;
  let controllers: Controllers;
  let products: StoreProduct[];
  beforeEach(() => {
    repos = createMockRepos();
    controllers = createMockControllers("Stores");
    controllers.Stores.initRepos(repos);
    products = Array.from({ length: 3 }, () =>
      createProduct(generateProductArgs(), repos)
    );

    vi.spyOn(repos.Products, "getAllProducts").mockReturnValue(products);
    const store = createStore(generateStoreName(), repos);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(store.Id);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
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
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {});
    expect(res).toEqual(products.map((p) => p.DTO));
  });

  it("✅should return some products because of name filter", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      name: products[0]?.Name.toUpperCase().split(" ")[0],
    });
    expect(res).toContainEqual(products[0]?.DTO);
  });

  it("✅should return some products because of keywords", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      keywords: [products[1]?.Description.toUpperCase().split(" ")[1] ?? ""],
    });
    expect(res).toContainEqual(products[1]?.DTO);
  });

  it("✅shouldn't return products because of made up name", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      name: "made up name that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up category", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      category: "made up category that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up keywords", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      keywords: ["made up keyword that doesn't exist"],
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min price", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      minPrice: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max price", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      maxPrice: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min store rating", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      minStoreRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max store rating", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      maxStoreRating: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min product rating", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      minProductRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max product rating", () => {
    vi.spyOn(
      controllers.Jobs,
      "canReceivePrivateDataFromStore"
    ).mockReturnValue(true);
    const res = controllers.Stores.searchProducts("uid", {
      maxProductRating: 0,
    });
    expect(res).toEqual([]);
  });
});
