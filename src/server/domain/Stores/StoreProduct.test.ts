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
  itUnitIntegration("✅sets name", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    await store.setName("new name");
    expect(store.Name).toBe("new name");
  });

  itUnitIntegration("❎gets empty name", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(async () => {
      await store.setName("");
    }).toThrow(ZodError);
    expect(store.Name).toBe(productData.name);
  });
});

describe("set quantity", () => {
  itUnitIntegration("✅sets quantity", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    await store.setQuantity(2);
    expect(store.Quantity).toBe(2);
  });

  itUnitIntegration("❎gets negative quantity", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(async () => {
      await store.setQuantity(-1);
    }).toThrow(ZodError);
    expect(store.Quantity).toBe(productData.quantity);
  });
});

describe("set price", () => {
  itUnitIntegration("✅sets price", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    await store.setPrice(2);
    expect(store.Price).toBe(2);
  });

  itUnitIntegration("❎gets negative price", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(async () => {
      await store.setPrice(-1);
    }).toThrow(ZodError);
    expect(store.Price).toBe(productData.price);
  });
});

describe("set category", () => {
  itUnitIntegration("✅sets category", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    await store.setCategory("new category");
    expect(store.Category).toBe("new category");
  });

  itUnitIntegration("❎gets empty category", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(async () => {
      await store.setCategory("");
    }).toThrow(ZodError);
    expect(store.Category).toBe(productData.category);
  });
});

describe("set description", () => {
  itUnitIntegration("✅sets description", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    await store.setDescription("new description");
    expect(store.Description).toBe("new description");
  });

  itUnitIntegration("❎gets empty description", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = createProduct(productData, repos, controllers);
    expect(async () => {
      await store.setDescription("");
    }).toThrow(ZodError);
    expect(store.Description).toBe(productData.description);
  });
});

describe("is quantity in stock", () => {
  it("✅returns true", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    expect(await product.isQuantityInStock(productData.quantity)).toBe(true);
  });

  it("✅returns false", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    expect(await product.isQuantityInStock(productData.quantity + 1)).toBe(
      false
    );
  });

  it("❎gets inactive store", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product, store } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    await store.setActive(false);
    expect(async () => await product.isQuantityInStock(1)).toThrow(
      "Store is not active"
    );
  });
});

describe("get price", () => {
  it("✅returns price", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    expect(product.getPriceByQuantity(1)).toBe(productData.price);
    expect(product.getPriceByQuantity(2)).toBe(2 * productData.price);
  });
});

describe("decrease quantity", () => {
  it("✅decreases quantity", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    await product.decreaseQuantity(1);
    expect(product.Quantity).toBe(productData.quantity - 1);
  });

  it("❎gets negative quantity", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    expect(async () => await product.decreaseQuantity(-1)).toThrow(
      "Quantity must be positive"
    );
    expect(product.Quantity).toBe(productData.quantity);
  });

  it("❎gets inactive store", async () => {
    const productData = generateProductArgs();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const { product, store } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    await store.setActive(false);
    expect(async () => await product.decreaseQuantity(1)).toThrow(
      "Store is not active"
    );
    expect(product.Quantity).toBe(productData.quantity);
  });
});
