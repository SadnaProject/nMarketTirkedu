import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { createMockRepos, createTestRepos } from "./_HasRepos";
import { type BasketDTO } from "../Users/Basket";
import { ZodError } from "zod";
import { StoreProduct } from "./StoreProduct";
import {
  createStore,
  createStoreWithProduct,
  generateProductArgs,
  generateStoreName,
} from "./_data";
import { itUnitIntegration } from "../_mock";

describe("constructor", () => {
  itUnitIntegration("✅creates a store", () => {
    const storeName = generateStoreName();
    const store = createStore(storeName);
    expect(store.Name).toBe(storeName);
    expect(store.IsActive).toBe(true);
  });

  itUnitIntegration("❎gets empty name", () => {
    expect(() => new Store("")).toThrow(ZodError);
  });
});

describe("createProduct", () => {
  itUnitIntegration("✅creates a product", (testType) => {
    const repos = createTestRepos(testType);
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
    const repos = createMockRepos();
    const store = createStore(storeName, repos);
    vi.spyOn(repos.Products, "addProduct").mockImplementationOnce(() => {
      throw new Error("addProduct failed");
    });
    const productData = generateProductArgs();
    expect(() => store.createProduct(productData)).toThrow("addProduct failed");
  });
});
describe("get basket price", () => {
  itUnitIntegration("✅gets basket price", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
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
