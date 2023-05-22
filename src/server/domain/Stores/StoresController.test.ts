import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockControllers } from "../_createControllers";
import { type Repos, createMockRepos } from "./_HasRepos";
import {
  createProduct,
  createPromise,
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
      createProduct(generateProductArgs(), repos, controllers)
    );

    vi.spyOn(repos.Products, "getActiveProducts").mockReturnValue(
      createPromise(products)
    );
    const store = createStore(generateStoreName(), repos, controllers);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(
      createPromise(store.Id)
    );
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
      createPromise(store)
    );
    vi.spyOn(controllers.PurchasesHistory, "getStoreRating").mockReturnValue(
      createPromise(3)
    );
    vi.spyOn(
      controllers.PurchasesHistory,
      "getReviewsByProduct"
    ).mockReturnValue(
      createPromise({
        avgRating: 3.5,
        reviews: [],
      })
    );
  });

  it("✅should return all products", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {});
    expect(res).toEqual(products.map((p) => p.getDTO()));
  });

  it("✅should return some products because of name filter", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      name: products[0]?.Name.toUpperCase().split(" ")[0],
    });
    expect(res).toContainEqual(products[0]?.getDTO());
  });

  it("✅should return some products because of keywords", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      keywords: [products[1]?.Description.toUpperCase().split(" ")[1] ?? ""],
    });
    expect(res).toContainEqual(products[1]?.getDTO());
  });

  it("✅shouldn't return products because of made up name", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      name: "made up name that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up category", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      category: "made up category that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up keywords", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      keywords: ["made up keyword that doesn't exist"],
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min price", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      minPrice: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max price", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      maxPrice: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min store rating", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      minStoreRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max store rating", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      maxStoreRating: 0,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min product rating", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      minProductRating: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max product rating", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      maxProductRating: 0,
    });
    expect(res).toEqual([]);
  });
});
