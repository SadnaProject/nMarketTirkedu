import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { createTestRepos } from "./HasRepos";
import { type BasketDTO } from "../Users/Basket";
import { ZodError } from "zod";
import { StoreProduct } from "./StoreProduct";
import {
  createStore,
  createStoreWithProduct,
  generateProductArgs,
  generateStoreName,
} from "./data";

describe("constructor", () => {
  it("✅creates a store", () => {
    const storeName = generateStoreName();
    const store = createStore(storeName);
    expect(store.Name).toBe(storeName);
    expect(store.IsActive).toBe(true);
  });

  it("❎gets empty name", () => {
    expect(() => new Store("")).toThrow(ZodError);
  });
});

describe("createProduct", () => {
  it("✅creates a product", () => {
    const repos = createTestRepos();
    const storeName = generateStoreName();
    const store = createStore(storeName, repos);
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const productData = generateProductArgs();
    const productId = store.createProduct(productData);
    const product = StoreProduct.fromDTO(
      { ...productData, id: productId },
      repos
    );
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValue([product]);
    expect(store.Products.length).toBe(1);
    expect(store.Products[0]).toEqual({ ...productData, id: productId });
  });

  it("❎fails in productRepo", () => {
    const storeName = generateStoreName();
    const repos = createTestRepos();
    const store = createStore(storeName, repos);
    vi.spyOn(repos.Products, "addProduct").mockImplementationOnce(() => {
      throw new Error("addProduct failed");
    });
    const productData = generateProductArgs();
    expect(() => store.createProduct(productData)).toThrow("addProduct failed");
  });
});

describe("get basket price", () => {
  it("✅gets basket price", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const { store, product } = createStoreWithProduct(productData, repos);
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store);
    vi.spyOn(repos.Products, "getProductById").mockReturnValueOnce(product);
    expect(store.getBasketPrice(basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
