import { describe, expect, it } from "vitest";
import { StoreProduct } from "./StoreProduct";
import { createTestRepos } from "./HasRepos";
import {
  createProduct,
  createStoreWithProduct,
  generateProductArgs,
} from "./data";
import { ZodError } from "zod";

describe("constructor", () => {
  it("✅creates a product", () => {
    const productData = generateProductArgs();
    const product = createProduct(productData);
    expect(product.Name).toBe(productData.name);
    expect(product.Quantity).toBe(productData.quantity);
    expect(product.Price).toBe(productData.price);
  });

  it("❎gets empty name", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, name: "" })).toThrow(
      ZodError
    );
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, quantity: -1 })).toThrow(
      ZodError
    );
  });

  it("❎gets negative price", () => {
    const productData = generateProductArgs();
    expect(() => new StoreProduct({ ...productData, price: -1 })).toThrow(
      ZodError
    );
  });
});

describe("set name", () => {
  it("✅sets name", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    store.Name = "new name";
    expect(store.Name).toBe("new name");
  });

  it("❎gets empty name", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Name = "";
    }).toThrow(ZodError);
  });
});

describe("set quantity", () => {
  it("✅sets quantity", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    store.Quantity = 2;
    expect(store.Quantity).toBe(2);
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Quantity = -1;
    }).toThrow(ZodError);
  });
});

describe("set price", () => {
  it("✅sets price", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    store.Price = 2;
    expect(store.Price).toBe(2);
  });

  it("❎gets negative price", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Price = -1;
    }).toThrow(ZodError);
  });
});

describe("set category", () => {
  it("✅sets category", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    store.Category = "new category";
    expect(store.Category).toBe("new category");
  });

  it("❎gets empty category", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Category = "";
    }).toThrow(ZodError);
  });
});

describe("set description", () => {
  it("✅sets description", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    store.Description = "new description";
    expect(store.Description).toBe("new description");
  });

  it("❎gets empty description", () => {
    const productData = generateProductArgs();
    const store = createProduct(productData);
    expect(() => {
      store.Description = "";
    }).toThrow(ZodError);
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
    const repos = createTestRepos();
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
    const repos = createTestRepos();
    const { product } = createStoreWithProduct(productData, repos);
    product.decreaseQuantity(1);
    expect(product.Quantity).toBe(productData.quantity - 1);
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const { product } = createStoreWithProduct(productData, repos);
    expect(() => product.decreaseQuantity(-1)).toThrow(
      "Quantity must be positive"
    );
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const { product, store } = createStoreWithProduct(productData, repos);
    store.IsActive = false;
    expect(() => product.decreaseQuantity(1)).toThrow("Store is not active");
  });
});
