import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { type Repos, createRepos } from "./HasRepos";
import { createStoreWithProduct, productData } from "./StoreProduct.test";

//* Vitest Docs: https://vitest.dev/api

const storeName = "store name";
export const createStore = (repos: Repos = createRepos()) =>
  new Store(storeName).initRepos(repos);

describe("constructor", () => {
  it("✅creates a store", () => {
    expect(createStore().Name).toBe(storeName);
  });

  it("❎gets empty name", () => {
    expect(() => new Store("")).toThrow();
  });
});

describe("createProduct", () => {
  it("✅creates a product", () => {
    const repos = createRepos();
    const productsRepoMock = vi.spyOn(repos.Products, "addProduct");
    const store = createStore(repos);
    const productId = store.createProduct(productData);
    expect(store.Products.length).toBe(1);
    expect(store.Products[0]?.id).toBe(productId);
    expect(store.Products[0]?.name).toBe(productData.name);
    expect(store.Products[0]?.quantity).toBe(productData.quantity);
    expect(store.Products[0]?.price).toBe(productData.price);
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
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store.DTO);
    const basket = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    expect(store.getBasketPrice(basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
