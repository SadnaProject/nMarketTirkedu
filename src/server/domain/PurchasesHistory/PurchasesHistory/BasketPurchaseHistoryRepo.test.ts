import { describe, expect, it } from "vitest";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { BasketPurchaseRepo } from "./BasketPurchaseHistoryRepo";
import { itUnitIntegration } from "server/domain/_mock";

const basketPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  storeId: "storeId",
  quantity: 1,
  price: 1,
};

describe("addBasketPurchase", () => {
  itUnitIntegration("should add a basket purchase", async (testType) => {
    const productIdToProductPurchase = new Map<string, ProductPurchase>();
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    await expect(
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toEqual(basketPurchase);
  });
});

describe("getPurchaseById", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    await expect(
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toEqual(basketPurchase);
  });
  itUnitIntegration("should throw if purchase not found", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await expect(() =>
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toThrow("Purchase not found");
  });
});

describe("getPurchaseByStoreId", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    await expect(
      basketPurchaseRepo.getPurchasesByStore(basketPurchase.StoreId)
    ).resolves.toEqual([basketPurchase]);
  });
  itUnitIntegration("it should return two purchases", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    const array = await basketPurchaseRepo.getPurchasesByStore(
      basketPurchase.StoreId
    );
    expect(array.length).toBe(2);
  });
});
describe("hasPurchase", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return true", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await basketPurchaseRepo.addBasketPurchase(basketPurchase);
    await expect(
      basketPurchaseRepo.hasPurchase(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toBe(true);
  });
  it("should return false", async () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await expect(
      basketPurchaseRepo.hasPurchase(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toBe(false);
  });
});
