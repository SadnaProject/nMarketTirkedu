import { describe, expect, it, vi } from "vitest";
import { StoreProduct } from "./StoreProduct";
import { type Repos, createRepos, createTestRepos } from "./HasRepos";
import { createStore } from "./Store.test";
//* Vitest Docs: https://vitest.dev/api

export const productData = {
  name: "product name",
  quantity: 2,
  price: 1,
  category: "category",
};

const createProduct = (repos: Repos = createTestRepos()) =>
  new StoreProduct(productData).initRepos(repos);

export const createStoreWithProduct = (repos: Repos = createRepos()) => {
  const store = createStore(repos);
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
  const productId = store.createProduct(productData);
  const product = StoreProduct.fromDTO(
    { ...productData, id: productId },
    repos
  );
  vi.spyOn(product, "Store", "get").mockReturnValue(store);
  return { store, product };
};

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

describe("is quantity in stock", () => {
  it("✅returns true", () => {
    const { product } = createStoreWithProduct();
    expect(product.isQuantityInStock(productData.quantity)).toBe(true);
  });

  it("✅returns false", () => {
    const { product } = createStoreWithProduct();
    expect(product.isQuantityInStock(productData.quantity + 1)).toBe(false);
  });

  it("❎gets inactive store", () => {
    const repos = createRepos();
    const { product, store } = createStoreWithProduct(repos);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store.DTO);
    store.IsActive = false;
    expect(() => product.isQuantityInStock(1)).toThrow();
  });
});

describe("get price", () => {
  it("✅returns price", () => {
    const { product } = createStoreWithProduct();
    expect(product.getPriceByQuantity(1)).toBe(productData.price);
    expect(product.getPriceByQuantity(2)).toBe(2 * productData.price);
  });
});
