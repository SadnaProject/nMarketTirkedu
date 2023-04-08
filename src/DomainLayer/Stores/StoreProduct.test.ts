import { describe, expect, it } from "vitest";
import { StoreProduct } from "./StoreProduct";
import { type Repos, createRepos } from "./HasRepos";
//* Vitest Docs: https://vitest.dev/api

export const productData = {
  name: "product name",
  quantity: 1,
  price: 1,
};

const createProduct = (repos: Repos = createRepos()) =>
  new StoreProduct(productData).initRepos(repos);

describe("constructor", () => {
  it("✅creates a product", () => {
    const product = createProduct();
    expect(product.Name).toBe(productData.name);
    expect(product.Quantity).toBe(productData.quantity);
    expect(product.Price).toBe(productData.price);
  });

  it("❎gets empty name", () => {
    expect(() => new StoreProduct({ ...productData, name: "" })).toThrow();
  });

  it("❎gets negative quantity", () => {
    expect(() => new StoreProduct({ ...productData, quantity: -1 })).toThrow();
  });

  it("❎gets negative price", () => {
    expect(() => new StoreProduct({ ...productData, price: -1 })).toThrow();
  });
});

describe("set quantity", () => {
  it("✅sets quantity", () => {
    const store = createProduct();
    store.Quantity = 2;
    expect(store.Quantity).toBe(2);
  });

  it("❎gets negative quantity", () => {
    const store = createProduct();
    expect(() => {
      store.Quantity = -1;
    }).toThrow();
  });
});

describe("set price", () => {
  it("✅sets price", () => {
    const store = createProduct();
    store.Price = 2;
    expect(store.Price).toBe(2);
  });

  it("❎gets negative price", () => {
    const store = createProduct();
    expect(() => {
      store.Price = -1;
    }).toThrow();
  });
});
