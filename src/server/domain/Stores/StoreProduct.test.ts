import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreProduct } from "./StoreProduct";
import { createMockRepos, createTestRepos } from "./helpers/_HasRepos";
import {
  createProduct,
  createStore,
  createStoreWithProduct,
  generateProductArgs,
  generateStoreName,
} from "../../data/Stores/helpers/_data";
import { ZodError } from "zod";
import { itUnitIntegration } from "../helpers/_mock";
import {
  createMockControllers,
  createTestControllers,
} from "../helpers/_createControllers";
import { resetDB } from "server/helpers/_Transactional";
beforeEach(async () => {
  await resetDB();
});

describe("constructor", () => {
  itUnitIntegration("✅creates a product", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);

    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    expect(product.Name).toBe(productData.name);
    expect(product.Quantity).toBe(productData.quantity);
    expect(product.Price).toBe(productData.price);
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
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
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await product.setName("new name");
    expect(product.Name).toBe("new name");
  });

  itUnitIntegration("❎gets empty name", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await expect(async () => {
      await product.setName("");
    }).rejects.toThrow(ZodError);
    expect(product.Name).toBe(productData.name);
  });
});

describe("set quantity", () => {
  itUnitIntegration("✅sets quantity", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await product.setQuantity(2);
    expect(product.Quantity).toBe(2);
  });

  itUnitIntegration("❎gets negative quantity", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await expect(async () => {
      await product.setQuantity(-1);
    }).rejects.toThrow(ZodError);
    expect(product.Quantity).toBe(productData.quantity);
  });
});

describe("set price", () => {
  itUnitIntegration("✅sets price", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await product.setPrice(2);
    expect(product.Price).toBe(2);
  });

  itUnitIntegration("❎gets negative price", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await expect(async () => {
      await product.setPrice(-1);
    }).rejects.toThrow(ZodError);
    expect(product.Price).toBe(productData.price);
  });
});

describe("set category", () => {
  itUnitIntegration("✅sets category", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await product.setCategory("new category");
    expect(product.Category).toBe("new category");
  });

  itUnitIntegration("❎gets empty category", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await expect(async () => {
      await product.setCategory("");
    }).rejects.toThrow(ZodError);
    expect(product.Category).toBe(productData.category);
  });
});

describe("set description", () => {
  itUnitIntegration("✅sets description", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await product.setDescription("new description");
    expect(product.Description).toBe("new description");
  });

  itUnitIntegration("❎gets empty description", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const store = await createStore(generateStoreName(), repos, controllers);
    const product = await createProduct(
      productData,
      repos,
      controllers,
      store.Id
    );
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await expect(async () => {
      await product.setDescription("");
    }).rejects.toThrow(ZodError);
    expect(product.Description).toBe(productData.description);
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    vi.spyOn(repos.Stores, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await store.setActive(false);
    await expect(
      async () => await product.isQuantityInStock(1)
    ).rejects.toThrow("Store is not active");
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );

    await expect(
      async () => await product.decreaseQuantity(-1)
    ).rejects.toThrow("Quantity can't be negative");
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
    vi.spyOn(repos.Products, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    vi.spyOn(repos.Stores, "setField").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await store.setActive(false);
    await expect(async () => await product.decreaseQuantity(1)).rejects.toThrow(
      "Store is not active"
    );
    expect(product.Quantity).toBe(productData.quantity);
  });
});
