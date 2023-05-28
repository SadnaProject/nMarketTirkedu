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
import { type StoreProduct as StoreProductDAO } from "@prisma/client";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";
describe("search products", () => {
  let repos: Repos;
  let controllers: Controllers;
  let products: StoreProduct[];
  beforeEach(async () => {
    repos = createMockRepos();
    controllers = createMockControllers("Stores");
    controllers.Stores.initRepos(repos);
    const store = await createStore(generateStoreName(), repos, controllers);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(
      createPromise(store.Id)
    );

    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
      createPromise(store.getDAO())
    );
    vi.spyOn(repos.Stores, "getDiscounts").mockReturnValue(
      createPromise(new DiscountPolicy(store.Id))
    );
    vi.spyOn(repos.Stores, "getConstraints").mockReturnValue(
      createPromise(new ConstraintPolicy(store.Id))
    );

    products = [];
    products.push(
      await createProduct(generateProductArgs(), repos, controllers, store.Id)
    );
    products.push(
      await createProduct(generateProductArgs(), repos, controllers, store.Id)
    );
    products.push(
      await createProduct(generateProductArgs(), repos, controllers, store.Id)
    );
    const ProductsDAO: StoreProductDAO[] = [];
    for (const product of products) {
      ProductsDAO.push(await product.getDAO());
    }
    vi.spyOn(
      controllers.PurchasesHistory,
      "getReviewsByProduct"
    ).mockReturnValue(
      createPromise({
        avgRating: 3.5,
        reviews: [],
      })
    );
    vi.spyOn(repos.Products, "getActiveProducts").mockReturnValue(
      createPromise(ProductsDAO)
    );
    vi.spyOn(repos.Products, "getSpecialPrices").mockReturnValue(
      createPromise(new Map<string, number>())
    );
    vi.spyOn(controllers.PurchasesHistory, "getStoreRating").mockReturnValue(
      createPromise(3)
    );
    vi.spyOn(controllers.Jobs, "makeStoreOwner").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
  });

  it("✅should return all products", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {});
    const realProducts = await Promise.all(
      products.map(async (p) => await p.getDTO())
    );
    expect(res).toEqual(realProducts);
  });

  it("✅should return some products because of name filter", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      name: products[0]?.Name.toUpperCase().split(" ")[0],
    });
    expect(res).toContainEqual(await products[0]?.getDTO());
  });

  it("✅should return some products because of keywords", async () => {
    vi.spyOn(controllers.Jobs, "canReceivePublicDataFromStore").mockReturnValue(
      createPromise(true)
    );
    const res = await controllers.Stores.searchProducts("uid", {
      keywords: [products[1]?.Description.toUpperCase().split(" ")[1] ?? ""],
    });
    expect(res).toContainEqual(await products[1]?.getDTO());
  });

  it("shouldn't return products because of made up name", async () => {
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
