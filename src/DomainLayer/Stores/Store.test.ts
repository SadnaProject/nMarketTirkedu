import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { type Repos, createRepos, createTestRepos } from "./HasRepos";
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
  it("✅💾creates a product", () => {
    const repos = createRepos();
    const productsRepoMock = vi.spyOn(repos.Products, "addProduct");
    const store = createStore(repos);
    const productId = store.createProduct(productData);
    expect(store.Products.length).toBe(1);
    expect(store.Products[0]).toEqual({ ...productData, id: productId });
    expect(productsRepoMock).toHaveBeenCalledOnce();
  });

  it("❎fails in productRepo", () => {
    const repos = createRepos();
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
    const repos = createRepos();
    const { store, product } = createStoreWithProduct(repos);
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductById").mockReturnValueOnce(product.DTO);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store.DTO);
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(store.Id);
    expect(store.getBasketPrice(basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
