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
import {
  createMockControllers,
  createTestControllers,
} from "../_createControllers";

describe("constructor", () => {
  itUnitIntegration("✅creates a product", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const product = createProduct(productData, repos, controllers);
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
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    store.Name = "new name";
    expect(store.Name).toBe("new name");
  });

  itUnitIntegration("❎gets empty name", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
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
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    store.Quantity = 2;
    expect(store.Quantity).toBe(2);
  });

  itUnitIntegration("❎gets negative quantity", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
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
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    store.Price = 2;
    expect(store.Price).toBe(2);
  });

  itUnitIntegration("❎gets negative price", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
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
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    store.Category = "new category";
    expect(store.Category).toBe("new category");
  });

  itUnitIntegration("❎gets empty category", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
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
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    store.Description = "new description";
    expect(store.Description).toBe("new description");
  });

  itUnitIntegration("❎gets empty description", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(() => {
      store.Description = "";
    }).toThrow(ZodError);
    expect(store.Description).toBe(productData.description);
  });
});

describe("is quantity in stock", () => {
  it("✅returns true", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = createStoreWithProduct(productData, repos, controllers);
    expect(product.isQuantityInStock(productData.quantity)).toBe(true);
  });

  it("✅returns false", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = createStoreWithProduct(productData, repos, controllers);
    expect(product.isQuantityInStock(productData.quantity + 1)).toBe(false);
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product, store } = createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    store.IsActive = false;
    expect(() => product.isQuantityInStock(1)).toThrow("Store is not active");
  });
});

describe("get price", () => {
  it("✅returns price", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = createStoreWithProduct(productData, repos, controllers);
    expect(product.getPriceByQuantity(1)).toBe(productData.price);
    expect(product.getPriceByQuantity(2)).toBe(2 * productData.price);
  });
});

describe("decrease quantity", () => {
  it("✅decreases quantity", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = createStoreWithProduct(productData, repos, controllers);
    product.decreaseQuantity(1);
    expect(product.Quantity).toBe(productData.quantity - 1);
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = createStoreWithProduct(productData, repos, controllers);
    expect(() => product.decreaseQuantity(-1)).toThrow(
      "Quantity must be positive"
    );
    expect(product.Quantity).toBe(productData.quantity);
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product, store } = createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    store.IsActive = false;
    expect(() => product.decreaseQuantity(1)).toThrow("Store is not active");
    expect(product.Quantity).toBe(productData.quantity);
  });
});
