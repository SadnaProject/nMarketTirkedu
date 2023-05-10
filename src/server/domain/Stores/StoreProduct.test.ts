import { describe, expect, it } from "vitest";
import { StoreProduct } from "./StoreProduct";
import { createMockRepos, createTestRepos } from "./_HasRepos";
import {
  createProduct,
  createStoreWithProduct,
  generateProductArgs,
} from "./_data";
import { ZodError } from "zod";
import { itUnitIntegration } from "../_mock";

describe("constructor", () => {
  itUnitIntegration("✅creates a product", () => {
    const productData = generateProductArgs();
    const product = createProduct(productData);
    expect(product.Name).toBe(productData.name);
    expect(product.Quantity).toBe(productData.quantity);
    expect(product.Price).toBe(productData.price);
  });

  itUnitIntegration("❎gets empty name", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, name: "" })).toThrow(
      ZodError
    );
  });

  itUnitIntegration("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, quantity: -1 })).toThrow(
      ZodError
    );
  });

  itUnitIntegration("❎gets negative price", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, price: -1 })).toThrow(
      ZodError
    );
  });
});

describe("set name", () => {
  itUnitIntegration("✅sets name", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const store = createProduct(productData, repos);
    store.Name = "new name";
    expect(store.Name).toBe("new name");
  });

  itUnitIntegration("❎gets empty name", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Name = "";
    }).toThrow(ZodError);
    expect(store.Name).toBe(productData.name);
  });
});

describe("set quantity", () => {
  itUnitIntegration("✅sets quantity", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const store = createProduct(productData, repos);
    store.Quantity = 2;
    expect(store.Quantity).toBe(2);
  });

  itUnitIntegration("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Quantity = -1;
    }).toThrow(ZodError);
    expect(store.Quantity).toBe(productData.quantity);
  });
});

describe("set price", () => {
  itUnitIntegration("✅sets price", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const store = createProduct(productData, repos);
    store.Price = 2;
    expect(store.Price).toBe(2);
  });

  itUnitIntegration("❎gets negative price", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Price = -1;
    }).toThrow(ZodError);
    expect(store.Price).toBe(productData.price);
  });
});

describe("set category", () => {
  itUnitIntegration("✅sets category", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const store = createProduct(productData, repos);
    store.Category = "new category";
    expect(store.Category).toBe("new category");
  });

  itUnitIntegration("❎gets empty category", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Category = "";
    }).toThrow(ZodError);
    expect(store.Category).toBe(productData.category);
  });
});

describe("set description", () => {
  itUnitIntegration("✅sets description", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const store = createProduct(productData, repos);
    store.Description = "new description";
    expect(store.Description).toBe("new description");
  });

  itUnitIntegration("❎gets empty description", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Description = "";
    }).toThrow(ZodError);
    expect(store.Description).toBe(productData.description);
  });
});

describe("is quantity in stock", () => {
  it("✅returns true", () => {
    const productData = generateProductArgs();
    const { product } = createStoreWithProduct(productData);
    expect(product.isQuantityInStock(productData.quantity)).toBe(true);
  });

  it("✅returns false", () => {
    const productData = generateProductArgs();
    const { product } = createStoreWithProduct(productData);
    expect(product.isQuantityInStock(productData.quantity + 1)).toBe(false);
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const { product, store } = createStoreWithProduct(productData, repos);
    store.IsActive = false;
    expect(() => product.isQuantityInStock(1)).toThrow("Store is not active");
  });
});

describe("get price", () => {
  it("✅returns price", () => {
    const productData = generateProductArgs();
    const { product } = createStoreWithProduct(productData);
    expect(product.getPriceByQuantity(1)).toBe(productData.price);
    expect(product.getPriceByQuantity(2)).toBe(2 * productData.price);
  });
});

describe("decrease quantity", () => {
  it("✅decreases quantity", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const { product } = createStoreWithProduct(productData, repos);
    product.decreaseQuantity(1);
    expect(product.Quantity).toBe(productData.quantity - 1);
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const { product } = createStoreWithProduct(productData, repos);
    expect(() => product.decreaseQuantity(-1)).toThrow(
      "Quantity must be positive"
    );
    expect(product.Quantity).toBe(productData.quantity);
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const { product, store } = createStoreWithProduct(productData, repos);
    store.IsActive = false;
    expect(() => product.decreaseQuantity(1)).toThrow("Store is not active");
    expect(product.Quantity).toBe(productData.quantity);
  });
});
