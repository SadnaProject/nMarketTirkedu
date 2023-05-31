import {
  Repos,
  createMockRepos,
  createRepos,
} from "server/domain/Stores/helpers/_HasRepos";
import { Controllers } from "server/domain/helpers/_HasController";
import { createMockControllers } from "server/domain/helpers/_createControllers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPromise,
  createStore,
  generateProductArgs,
  generateStoreName,
  productToProductData,
} from "./helpers/_data";
import { Store } from "server/domain/Stores/Store";
import { StoreProduct } from "server/domain/Stores/StoreProduct";
import { TRPCError } from "@trpc/server";
import { resetDB } from "server/helpers/_Transactional";
let repos: Repos;
let controllers: Controllers;
let store: Store;
beforeEach(async () => {
  await resetDB();
  repos = createRepos();
  controllers = createMockControllers("Stores");
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  store = new Store(generateStoreName())
    .initRepos(repos)
    .initControllers(controllers);
  await repos.Stores.addStore(store.Name, store.Id);
});

describe("add product", () => {
  it("✅adds product", async () => {
    const product = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await expect(
      repos.Products.addProduct(
        store.Id,
        productToProductData(product),
        product.Id
      )
    ).resolves.not.toThrow();
    const products = await repos.Products.getProductsByStoreId(store.Id);
    expect(products).toEqual([await product.getDAO()]);
  });

  it("✅adds multiple products to one store", async () => {
    const product1 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    const product2 = new StoreProduct(generateProductArgs())
      .initControllers(controllers)
      .initRepos(repos);
    await repos.Products.addProduct(
      store.Id,
      productToProductData(product1),
      product1.Id
    );

    await repos.Products.addProduct(
      store.Id,
      productToProductData(product2),
      product2.Id
    );
    expect(await repos.Products.getProductsByStoreId(store.Id)).toEqual([
      await product1.getDAO(),
      await product2.getDAO(),
    ]);
  });

  describe("get all products", () => {
    it("✅returns no products", async () => {
      expect(await repos.Products.getAllProducts()).toEqual([]);
    });

    it("✅returns some products", async () => {
      const product1 = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      const product2 = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      const product3 = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);

      await repos.Products.addProduct(
        store.Id,
        productToProductData(product1),
        product1.Id
      );

      await repos.Products.addProduct(
        store.Id,
        productToProductData(product2),
        product2.Id
      );

      await repos.Products.addProduct(
        store.Id,
        productToProductData(product3),
        product3.Id
      );
      expect(await repos.Products.getAllProducts()).toEqual([
        await product1.getDAO(),
        await product2.getDAO(),
        await product3.getDAO(),
      ]);
    });
  });

  describe("get product by id", () => {
    it("✅returns product", async () => {
      const product = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      await repos.Products.addProduct(
        store.Id,
        productToProductData(product),
        product.Id
      );
      expect(await repos.Products.getProductById(product.Id)).toEqual(
        await product.getDAO()
      );
    });

    it("❎doesn't find product", async () => {
      await expect(
        async () => await repos.Products.getStoreIdByProductId("made up id")
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("get products by store id", () => {
    it("✅returns no products because store does not exist", async () => {
      expect(await repos.Products.getProductsByStoreId("made up id")).toEqual(
        []
      );
    });

    it("✅returns no products but store exists", async () => {
      const product = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      await repos.Products.addProduct(
        store.Id,
        productToProductData(product),
        product.Id
      );
      await repos.Products.deleteProduct(product.Id);
      expect(await repos.Products.getProductsByStoreId(store.Id)).toEqual([]);
    });
  });

  describe("get store id by product id", () => {
    it("✅returns store id", async () => {
      const product = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      await repos.Products.addProduct(
        store.Id,
        productToProductData(product),
        product.Id
      );
      expect(await repos.Products.getStoreIdByProductId(product.Id)).toEqual(
        store.Id
      );
    });

    it("❎doesn't find product but there are other products", async () => {
      const product = new StoreProduct(generateProductArgs())
        .initControllers(controllers)
        .initRepos(repos);
      await repos.Products.addProduct(
        store.Id,
        productToProductData(product),
        product.Id
      );
      await expect(
        async () => await repos.Products.getStoreIdByProductId("made up id")
      ).rejects.toThrow(TRPCError);
    });

    it("❎doesn't find product because there are no products", async () => {
      await expect(
        async () => await repos.Products.getStoreIdByProductId("made up id")
      ).rejects.toThrow(TRPCError);
    });
  });
});
