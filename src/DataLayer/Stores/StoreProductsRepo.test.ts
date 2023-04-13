import { beforeEach, describe, expect, it } from "vitest";
import { StoreProductsRepo } from "./StoreProductsRepo";
import { generateProductDTO } from "~/DomainLayer/Stores/StoreProduct.test";

let repo: StoreProductsRepo;

beforeEach(() => {
  repo = new StoreProductsRepo();
});

describe("add product", () => {
  it("✅adds product", () => {
    const product = generateProductDTO();
    expect(() => repo.addProduct("store id", product)).not.toThrow();
    expect(repo.getProductsByStoreId("store id")).toEqual([product]);
  });

  it("✅adds multiple products to one store", () => {
    const product1 = generateProductDTO();
    expect(() => repo.addProduct("store id", product1)).not.toThrow();
    const product2 = generateProductDTO();
    expect(() => repo.addProduct("store id", product2)).not.toThrow();
    expect(repo.getProductsByStoreId("store id")).toEqual([product1, product2]);
  });
});

describe("get all products", () => {
  it("✅returns no products", () => {
    expect(repo.getAllProducts()).toEqual([]);
  });

  it("✅returns some products", () => {
    const product1 = generateProductDTO();
    repo.addProduct("store id 1", product1);
    const product2 = generateProductDTO();
    repo.addProduct("store id 1", product2);
    const product3 = generateProductDTO();
    repo.addProduct("store id 2", product3);
    expect(repo.getAllProducts()).toEqual([product1, product2, product3]);
  });
});

describe("get product by id", () => {
  it("✅returns product", () => {
    const product = generateProductDTO();
    repo.addProduct("store id 1", product);
    expect(repo.getProductById(product.id)).toEqual(product);
  });

  it("❎doesn't find product", () => {
    expect(() => repo.getProductById("made up id")).toThrow(
      "Product not found"
    );
  });
});

describe("get products by store id", () => {
  it("✅returns no products because store does not exist", () => {
    expect(repo.getProductsByStoreId("made up id")).toEqual([]);
  });

  it("✅returns no products but store exists", () => {
    const product = generateProductDTO();
    repo.addProduct("store id 1", product);
    repo.deleteProduct(product.id);
    expect(repo.getProductsByStoreId("store id 1")).toEqual([]);
  });
});

describe("get store id by product id", () => {
  it("✅returns store id", () => {
    const product = generateProductDTO();
    repo.addProduct("store id 1", product);
    expect(repo.getStoreIdByProductId(product.id)).toEqual("store id 1");
  });

  it("❎doesn't find product but there are other products", () => {
    repo.addProduct("store id 1", generateProductDTO());
    expect(() => repo.getStoreIdByProductId("made up id")).toThrow(
      "Product not found"
    );
  });

  it("❎doesn't find product because there are no products", () => {
    expect(() => repo.getStoreIdByProductId("made up id")).toThrow(
      "Product not found"
    );
  });
});

describe("set name", () => {
  it("✅sets name", () => {
    const product = generateProductDTO();
    repo.addProduct("store id", product);
    expect(() => repo.setName(product.id, "new name")).not.toThrow();
    expect(repo.getProductById(product.id).name).toBe("new name");
  });

  it("❎doesn't find product", () => {
    expect(() => repo.setName("made up id", "new name")).toThrow(
      "Product not found"
    );
  });
});

describe("set price", () => {
  it("✅sets price", () => {
    const product = generateProductDTO();
    repo.addProduct("store id", product);
    expect(() => repo.setPrice(product.id, 10)).not.toThrow();
    expect(repo.getProductById(product.id).price).toBe(10);
  });

  it("❎doesn't find product", () => {
    expect(() => repo.setPrice("made up id", 10)).toThrow("Product not found");
  });
});

describe("set quantity", () => {
  it("✅sets quantity", () => {
    const product = generateProductDTO();
    repo.addProduct("store id", product);
    expect(() => repo.setQuantity(product.id, 10)).not.toThrow();
    expect(repo.getProductById(product.id).quantity).toBe(10);
  });

  it("❎doesn't find product", () => {
    expect(() => repo.setQuantity("made up id", 10)).toThrow(
      "Product not found"
    );
  });
});

describe("set category", () => {
  it("✅sets category", () => {
    const product = generateProductDTO();
    repo.addProduct("store id", product);
    expect(() => repo.setCategory(product.id, "new category")).not.toThrow();
    expect(repo.getProductById(product.id).category).toBe("new category");
  });

  it("❎doesn't find product", () => {
    expect(() => repo.setCategory("made up id", "new category")).toThrow(
      "Product not found"
    );
  });
});

describe("set description", () => {
  it("✅sets description", () => {
    const product = generateProductDTO();
    repo.addProduct("store id", product);
    expect(() =>
      repo.setDescription(product.id, "new description")
    ).not.toThrow();
    expect(repo.getProductById(product.id).description).toBe("new description");
  });

  it("❎doesn't find product", () => {
    expect(() => repo.setDescription("made up id", "new description")).toThrow(
      "Product not found"
    );
  });
});
