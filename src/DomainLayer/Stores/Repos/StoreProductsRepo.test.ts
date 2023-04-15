import { beforeEach, describe, expect, it } from "vitest";
import {
  createProduct,
  generateProductArgs,
} from "~/DomainLayer/Stores/StoreProduct.test";
import { type Repos, createTestRepos } from "../HasRepos";

let repos: Repos;

beforeEach(() => {
  repos = createTestRepos("Products");
});

describe("add product", () => {
  it("✅adds product", () => {
    const product = createProduct(generateProductArgs());
    expect(() => repos.Products.addProduct("store id", product)).not.toThrow();
    expect(repos.Products.getProductsByStoreId("store id")).toEqual([product]);
  });

  it("✅adds multiple products to one store", () => {
    const product1 = createProduct(generateProductArgs());
    expect(() => repos.Products.addProduct("store id", product1)).not.toThrow();
    const product2 = createProduct(generateProductArgs());
    expect(() => repos.Products.addProduct("store id", product2)).not.toThrow();
    expect(repos.Products.getProductsByStoreId("store id")).toEqual([
      product1,
      product2,
    ]);
  });
});

describe("get all products", () => {
  it("✅returns no products", () => {
    expect(repos.Products.getAllProducts()).toEqual([]);
  });

  it("✅returns some products", () => {
    const product1 = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 1", product1);
    const product2 = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 1", product2);
    const product3 = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 2", product3);
    expect(repos.Products.getAllProducts()).toEqual([
      product1,
      product2,
      product3,
    ]);
  });
});

describe("get product by id", () => {
  it("✅returns product", () => {
    const product = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 1", product);
    expect(repos.Products.getProductById(product.Id)).toEqual(product);
  });

  it("❎doesn't find product", () => {
    expect(() => repos.Products.getProductById("made up id")).toThrow(
      "Product not found"
    );
  });
});

describe("get products by store id", () => {
  it("✅returns no products because store does not exist", () => {
    expect(repos.Products.getProductsByStoreId("made up id")).toEqual([]);
  });

  it("✅returns no products but store exists", () => {
    const product = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 1", product);
    repos.Products.deleteProduct(product.Id);
    expect(repos.Products.getProductsByStoreId("store id 1")).toEqual([]);
  });
});

describe("get store id by product id", () => {
  it("✅returns store id", () => {
    const product = createProduct(generateProductArgs());
    repos.Products.addProduct("store id 1", product);
    expect(repos.Products.getStoreIdByProductId(product.Id)).toEqual(
      "store id 1"
    );
  });

  it("❎doesn't find product but there are other products", () => {
    repos.Products.addProduct(
      "store id 1",
      createProduct(generateProductArgs())
    );
    expect(() => repos.Products.getStoreIdByProductId("made up id")).toThrow(
      "Product not found"
    );
  });

  it("❎doesn't find product because there are no products", () => {
    expect(() => repos.Products.getStoreIdByProductId("made up id")).toThrow(
      "Product not found"
    );
  });
});
