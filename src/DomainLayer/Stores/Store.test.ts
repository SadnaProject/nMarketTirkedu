import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { type Repos, createTestRepos } from "./HasRepos";
import { createStoreWithProduct, productData } from "./StoreProduct.test";
import { type BasketDTO } from "../Users/Basket";

//* Vitest Docs: https://vitest.dev/api

const storeName = "store name";
export const createStore = (repos: Repos = createTestRepos()) =>
  new Store(storeName).initRepos(repos);

describe("constructor", () => {
  it("✅creates a store", () => {
    const store = createStore();
    expect(store.Name).toBe(storeName);
    expect(store.IsActive).toBe(true);
  });

  it("❎gets empty name", () => {
    expect(() => new Store("")).toThrow();
  });
});

describe("createProduct", () => {
  it("✅creates a product", () => {
    const repos = createTestRepos();
    const store = createStore(repos);
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const productId = store.createProduct(productData);
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValue([
      { ...productData, id: productId },
    ]);
    expect(store.Products.length).toBe(1);
    expect(store.Products[0]).toEqual({ ...productData, id: productId });
  });

  it("❎fails in productRepo", () => {
    const repos = createTestRepos();
    const productsRepoMock = vi.spyOn(repos.Products, "addProduct");
    productsRepoMock.mockImplementation(() => {
      throw new Error("error");
    });
    const store = createStore(repos);
    expect(() => store.createProduct(productData)).toThrow();
  });
});

describe("get basket price", () => {
  it("✅gets basket price", () => {
    const repos = createTestRepos();
    const { store, product } = createStoreWithProduct(repos);
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductById").mockReturnValueOnce(product.DTO);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(store.Id);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store.DTO);
    expect(store.getBasketPrice(basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
