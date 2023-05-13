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
import { s } from "vitest/dist/env-afee91f0";

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
describe("Discounts", () => {
  itUnitIntegration("add simple discount", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    productData.quantity = 5;
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockReturnValue(product);
    const price = store.getBasketPrice(basket);
    expect(price).toBe(product.Price * productData.quantity);
    const discountId = store.addDiscount({
      type: "Simple",
      searchFor: productData.name,
      discount: 15,
      discountOn: "product",
      condition: {
        type: "Literal",
        subType: "Product",
        amount: 1,
        searchFor: productData.name,
        conditionType: "AtLeast",
      },
    });
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100)
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration(
    "add compose max discount with simple condition",
    (testType) => {
      const productData = generateProductArgs();
      const repos = createTestRepos(testType);
      const { store, product } = createStoreWithProduct(productData, repos);
      productData.quantity = 5;
      const basket: BasketDTO = {
        storeId: store.Id,
        products: [
          { quantity: productData.quantity, storeProductId: product.Id },
        ],
      };
      vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
        product,
      ]);
      vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
      vi.spyOn(repos.Products, "getProductById").mockReturnValue(product);
      const price = store.getBasketPrice(basket);
      expect(price).toBe(product.Price * productData.quantity);
      const discountId = store.addDiscount({
        type: "Max",
        left: {
          condition: {
            type: "Literal",
            subType: "Product",
            amount: 1,
            searchFor: productData.name,
            conditionType: "AtLeast",
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Literal",
            subType: "Product",
            amount: 1,
            searchFor: productData.name,
            conditionType: "AtLeast",
          },
          discount: 50,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount = store.getBasketPrice(basket);
      expect(priceWithDiscount).toBe(
        product.Price * productData.quantity * (50 / 100)
      );
      store.removeDiscount(discountId);
      expect(store.getBasketPrice(basket)).toBe(price);
    }
  );
  itUnitIntegration(
    "add compose ADD discount with simple condition",
    (testType) => {
      const productData = generateProductArgs();
      const repos = createTestRepos(testType);
      const { store, product } = createStoreWithProduct(productData, repos);
      productData.quantity = 5;
      const basket: BasketDTO = {
        storeId: store.Id,
        products: [
          { quantity: productData.quantity, storeProductId: product.Id },
        ],
      };
      vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
        product,
      ]);
      vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
      vi.spyOn(repos.Products, "getProductById").mockReturnValue(product);
      const price = store.getBasketPrice(basket);
      expect(price).toBe(product.Price * productData.quantity);
      const discountId = store.addDiscount({
        type: "Add",
        left: {
          condition: {
            type: "Literal",
            subType: "Product",
            amount: 1,
            searchFor: productData.name,
            conditionType: "AtLeast",
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Literal",
            subType: "Product",
            amount: 1,
            searchFor: productData.name,
            conditionType: "AtLeast",
          },
          discount: 50,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount = store.getBasketPrice(basket);
      expect(priceWithDiscount).toBe(
        product.Price * productData.quantity * (35 / 100)
      );
      store.removeDiscount(discountId);
      expect(store.getBasketPrice(basket)).toBe(price);
    }
  );
  itUnitIntegration(
    "add compose MAX discount with compose logic implies condition",
    (testType) => {
      const productData = generateProductArgs();
      const repos = createTestRepos(testType);
      const { store, product } = createStoreWithProduct(productData, repos);
      productData.quantity = 5;
      const basket: BasketDTO = {
        storeId: store.Id,
        products: [
          { quantity: productData.quantity, storeProductId: product.Id },
        ],
      };
      vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
        product,
      ]);
      vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
      vi.spyOn(repos.Products, "getProductById").mockReturnValue(product);
      const price = store.getBasketPrice(basket);
      expect(price).toBe(product.Price * productData.quantity);

      const discountId = store.addDiscount({
        type: "Add",
        left: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 25,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount = store.getBasketPrice(basket);
      expect(priceWithDiscount).toBe(
        product.Price * productData.quantity * (60 / 100)
      );
      store.removeDiscount(discountId);
      expect(store.getBasketPrice(basket)).toBe(price);
      const discountId1 = store.addDiscount({
        type: "Add",
        left: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 2,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 25,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount1 = store.getBasketPrice(basket);
      expect(priceWithDiscount1).toBe(
        product.Price * productData.quantity * (85 / 100)
      );
      store.removeDiscount(discountId1);
      expect(store.getBasketPrice(basket)).toBe(price);
    }
  );
});
