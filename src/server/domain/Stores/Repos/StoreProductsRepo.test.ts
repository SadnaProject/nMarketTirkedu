import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Repos, createMockRepos } from "../_HasRepos";
import { createProduct, generateProductArgs } from "../_data";
import { Controllers } from "server/domain/_HasController";
import { createMockControllers } from "server/domain/_createControllers";

let repos: Repos;
let controllers: Controllers;
beforeEach(() => {
  repos = createMockRepos("Products");
  controllers = createMockControllers("Stores");
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    { avgRating: 0, reviews: [] }
  );
});

describe("add product", () => {
  it("✅adds product", async () => {
    const product = createProduct(generateProductArgs(), repos, controllers);
    expect(
      async () => await repos.Products.addProduct("store id", product)
    ).not.toThrow();
    expect(await repos.Products.getProductsByStoreId("store id")).toEqual([
      product,
    ]);
  });

  it("✅adds multiple products to one store", async () => {
    const product1 = createProduct(generateProductArgs(), repos, controllers);
    expect(
      async () => await repos.Products.addProduct("store id", product1)
    ).not.toThrow();
    const product2 = createProduct(generateProductArgs(), repos, controllers);
    expect(
      async () => await repos.Products.addProduct("store id", product2)
    ).not.toThrow();
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
    const product1 = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 1", product1);
    const product2 = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 1", product2);
    const product3 = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 2", product3);
    expect(await repos.Products.getAllProducts()).toEqual([
      product1,
      product2,
      product3,
    ]);
  });
});

describe("get product by id", () => {
  it("✅returns product", async () => {
    const product = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 1", product);
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
    const product = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 1", product);
    await repos.Products.deleteProduct(product.Id);
    expect(await repos.Products.getProductsByStoreId("store id 1")).toEqual([]);
  });
});

describe("get store id by product id", () => {
  it("✅returns store id", async () => {
    const product = createProduct(generateProductArgs(), repos, controllers);
    await repos.Products.addProduct("store id 1", product);
    expect(await repos.Products.getStoreIdByProductId(product.Id)).toEqual(
      "store id 1"
    );
  });

  it("❎doesn't find product but there are other products", async () => {
    await repos.Products.addProduct(
      "store id 1",
      createProduct(generateProductArgs(), repos, controllers)
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
