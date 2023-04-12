import { describe, expect, it, vi } from "vitest";
import {
  StoreProduct,
  storeProductArgsSchema,
  type StoreProductArgs,
  StoreProductDTOSchema,
} from "./StoreProduct";
import { type Repos, createTestRepos } from "./HasRepos";
import { createStore, generateStoreName } from "./Store.test";
import { ZodError } from "zod";
import { generateMock } from "@anatine/zod-mock";
import { faker } from "@faker-js/faker/locale/en";

export function generateProductArgs() {
  return generateMock(storeProductArgsSchema, {
    stringMap: {
      name: () => faker.commerce.productName(),
      category: () => faker.commerce.department(),
      description: () => faker.commerce.productDescription(),
    },
  });
}

export function generateProductDTO() {
  return generateMock(StoreProductDTOSchema, {
    stringMap: {
      name: () => faker.commerce.productName(),
      category: () => faker.commerce.department(),
      description: () => faker.commerce.productDescription(),
    },
  });
}

const createProduct = (
  args: StoreProductArgs,
  repos: Repos = createTestRepos()
) => {
  return new StoreProduct(args).initRepos(repos);
};

export function createStoreWithProduct(
  productData: StoreProductArgs,
  repos: Repos = createTestRepos()
) {
  const store = createStore(generateStoreName(), repos);
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
  const productId = store.createProduct(productData);
  const product = StoreProduct.fromDTO(
    { ...productData, id: productId },
    repos
  );
  vi.spyOn(product, "Store", "get").mockReturnValue(store);
  return { store, product };
}

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

describe("set quantity", () => {
  it("✅sets quantity", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const store = createProduct(productData, repos);
    vi.spyOn(repos.Products, "setQuantity").mockReturnValueOnce();
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
    vi.spyOn(repos.Products, "setPrice").mockReturnValueOnce();
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
    vi.spyOn(repos.Stores, "setIsActive").mockReturnValueOnce();
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
    vi.spyOn(repos.Products, "setQuantity").mockReturnValueOnce();
    product.decreaseQuantity(1);
    expect(product.Quantity).toBe(productData.quantity - 1);
  });

  it("❎gets negative quantity", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const { product } = createStoreWithProduct(productData, repos);
    vi.spyOn(repos.Products, "setQuantity").mockReturnValueOnce();
    expect(() => product.decreaseQuantity(-1)).toThrow(
      "Quantity must be positive"
    );
  });

  it("❎gets inactive store", () => {
    const productData = generateProductArgs();
    const repos = createTestRepos();
    const { product, store } = createStoreWithProduct(productData, repos);
    vi.spyOn(repos.Stores, "setIsActive").mockReturnValueOnce();
    store.IsActive = false;
    expect(() => product.decreaseQuantity(1)).toThrow("Store is not active");
  });
});
