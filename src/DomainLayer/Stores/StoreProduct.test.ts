import { describe, expect, it, beforeEach } from "vitest";
import { StoreProduct } from "./StoreProduct";
//* Vitest Docs: https://vitest.dev/api

const storeProductName = "product name";
const storeProductQuantity = 1;
const storeProductPrice = 1;

describe("constructor", () => {
  it("✅creates a store product", () => {
    expect(() => {
      const store = new StoreProduct({
        name: storeProductName,
        quantity: storeProductQuantity,
        price: storeProductPrice,
      });
      expect(store.Name).toBe(storeProductName);
      expect(store.Quantity).toBe(storeProductQuantity);
      expect(store.Price).toBe(storeProductPrice);
    }).not.toThrow();
  });

  it("❎gets empty name", () => {
    expect(
      () =>
        new StoreProduct({
          name: "",
          quantity: storeProductQuantity,
          price: storeProductPrice,
        })
    ).toThrow();
  });

  it("❎gets negative quantity", () => {
    expect(
      () =>
        new StoreProduct({
          name: storeProductName,
          quantity: -1,
          price: storeProductPrice,
        })
    ).toThrow();
  });

  it("❎gets negative price", () => {
    expect(
      () =>
        new StoreProduct({
          name: storeProductName,
          quantity: storeProductQuantity,
          price: -1,
        })
    ).toThrow();
  });
});

describe("set quantity", () => {
  let store: StoreProduct;

  beforeEach(() => {
    store = new StoreProduct({
      name: storeProductName,
      quantity: storeProductQuantity,
      price: storeProductPrice,
    });
  });

  it("✅sets quantity", () => {
    expect(() => {
      store.Quantity = 2;
      expect(store.Quantity).toBe(2);
    }).not.toThrow();
  });

  it("❎gets negative quantity", () => {
    expect(() => {
      store.Quantity = -1;
    }).toThrow();
  });
});

describe("set price", () => {
  let store: StoreProduct;

  beforeEach(() => {
    store = new StoreProduct({
      name: storeProductName,
      quantity: storeProductQuantity,
      price: storeProductPrice,
    });
  });

  it("✅sets price", () => {
    expect(() => {
      store.Price = 2;
      expect(store.Price).toBe(2);
    }).not.toThrow();
  });

  it("❎gets negative price", () => {
    expect(() => {
      store.Price = -1;
    }).toThrow();
  });
});
