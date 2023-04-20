import { describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { type ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { BasketPurchaseRepo } from "./BasketPurchaseHistoryRepo";
import { array } from "zod";
import { itUnitIntegration } from "@domain/_mock";

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
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should add a basket purchase", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    expect(
      basketPurchaseRepo.getPurchaseById(basketPurchase.PurchaseId)
    ).toEqual(basketPurchase);
  });
});

describe("getPurchaseById", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    expect(
      basketPurchaseRepo.getPurchaseById(basketPurchase.PurchaseId)
    ).toEqual(basketPurchase);
  });
  itUnitIntegration("should throw if purchase not found", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    expect(() =>
      basketPurchaseRepo.getPurchaseById(basketPurchase.PurchaseId)
    ).toThrow("Purchase not found");
  });
});

describe("getPurchaseByStoreId", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    expect(
      basketPurchaseRepo.getPurchasesByStore(basketPurchase.StoreId)
    ).toEqual([basketPurchase]);
  });
  itUnitIntegration("it should return two purchases", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    expect(
      basketPurchaseRepo.getPurchasesByStore(basketPurchase.StoreId).length
    ).toBe(2);
  });
});
describe("hasPurchase", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return true", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    basketPurchaseRepo.addBasketPurchase(basketPurchase);
    expect(basketPurchaseRepo.hasPurchase(basketPurchase.PurchaseId)).toBe(
      true
    );
  });
  it("should return false", () => {
    const basketPurchase = new BasketPurchase(
      basketPurchaseData.storeId,
      productIdToProductPurchase,
      basketPurchaseData.price,
      basketPurchaseData.purchaseId
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    expect(basketPurchaseRepo.hasPurchase(basketPurchase.PurchaseId)).toBe(
      false
    );
  });
});
