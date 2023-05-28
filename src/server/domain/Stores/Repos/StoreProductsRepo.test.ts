import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Repos, createMockRepos } from "../_HasRepos";
import {
  createProduct,
  createPromise,
  createStore,
  generateProductArgs,
  generateStoreName,
  productToProductData,
} from "../_data";
import { type Controllers } from "server/domain/_HasController";
import { createMockControllers } from "server/domain/_createControllers";
import { Store } from "../Store";
import { StoreProduct } from "../StoreProduct";

let repos: Repos;
let controllers: Controllers;
let store: Store;
beforeEach(async () => {
  repos = createMockRepos("Products");
  controllers = createMockControllers("Stores");
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  store = await createStore(generateStoreName(), repos, controllers);
});

describe("add product", () => {
  it("✅adds product", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await expect(
      async () =>
        await repos.Products.addProduct(
          "store id",
          productToProductData(product),
          product.Id
        )
    ).resolves.not.toThrow();
    expect(await repos.Products.getProductsByStoreId("store id")).toEqual([
      product,
    ]);
  });

  it("✅adds multiple products to one store", async () => {
    const product1 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    const product2 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await expect(
      async () =>
        await repos.Products.addProduct(
          "store id",
          productToProductData(product1),
          product1.Id
        )
    ).resolves.not.toThrow();

    await expect(
      async () =>
        await repos.Products.addProduct(
          "store id",
          productToProductData(product2),
          product2.Id
        )
    ).resolves.not.toThrow();
    expect(await repos.Products.getProductsByStoreId("store id")).toEqual([
      product1,
      product2,
    ]);
  });
});

describe("get all products", () => {
  it("✅returns no products", async () => {
    expect(await repos.Products.getAllProducts()).toEqual([]);
  });

  it("✅returns some products", async () => {
    const product1 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    const product2 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    const product3 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);

    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product1),
      product1.Id
    );

    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product2),
      product2.Id
    );

    await repos.Products.addProduct(
      "store id 2",
      productToProductData(product3),
      product3.Id
    );
    expect(await repos.Products.getAllProducts()).toEqual([
      product1,
      product2,
      product3,
    ]);
  });
});

describe("get product by id", () => {
  it("✅returns product", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product),
      product.Id
    );
    expect(await repos.Products.getProductById(product.Id)).toEqual(product);
  });

  it("❎doesn't find product", () => {
    expect(
      async () => await repos.Products.getProductById("made up id")
    ).toThrow("Product not found");
  });
});

describe("get products by store id", () => {
  it("✅returns no products because store does not exist", async () => {
    expect(await repos.Products.getProductsByStoreId("made up id")).toEqual([]);
  });

  it("✅returns no products but store exists", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product),
      product.Id
    );
    await repos.Products.deleteProduct(product.Id);
    expect(await repos.Products.getProductsByStoreId("store id 1")).toEqual([]);
  });
});

describe("get store id by product id", () => {
  it("✅returns store id", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product),
      product.Id
    );
    expect(await repos.Products.getStoreIdByProductId(product.Id)).toEqual(
      "store id 1"
    );
  });

  it("❎doesn't find product but there are other products", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await repos.Products.addProduct(
      "store id 1",
      productToProductData(product),
      product.Id
    );
    expect(
      async () => await repos.Products.getStoreIdByProductId("made up id")
    ).toThrow("Product not found");
  });

  it("❎doesn't find product because there are no products", () => {
    expect(
      async () => await repos.Products.getStoreIdByProductId("made up id")
    ).toThrow("Product not found");
  });
});
